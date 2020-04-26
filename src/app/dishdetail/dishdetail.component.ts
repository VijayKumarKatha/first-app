import { Component, OnInit, ViewChild , Inject} from '@angular/core';
import { DishService } from '../services/dish.service';
import { Params , ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { switchMap } from 'rxjs/operators';
import { visibility, flyInOut, expand } from '../animations/app.animation';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
  animations: [
    visibility(),
    flyInOut(),
    expand()
  ]
})
export class DishdetailComponent implements OnInit {

    dish: Dish;
    dishcopy: Dish;
    dishIds: string[];
    prev: string;
    next: string;
    errMess: string;
    visibility = 'shown';

    commentForm: FormGroup;

    formErrors = {
      'author': '',
      'comment': ''
    };

    validationMessages = {
      'author': {
        'required': 'Author Name is required',
        'minlength': 'Author Name must be atleast 2 characters long'
      },
      'comment': {
        'required': 'Your Comment is required'
      }
    };

  constructor(private dishservice: DishService,
    @Inject('BaseURL') public BaseURL,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder ){
      this.createForm();
     }

  ngOnInit(): void {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.getDish(params['id']);}))
    .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown';},
      errmess =>this.errMess = <any>errmess );
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }
  
  goBack(): void{
    this.location.back();
  }

  createForm() {
    this.commentForm = this.fb.group({
      comment: ['', [Validators.required ] ],
      rating: [0],
      author: ['', [Validators.required, Validators.minLength(2) ] ],
      date: ['']
    });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); //(re)set validation messages now
  }

  onSubmit() {
    this.commentForm.value.date=new Date().toISOString();
    this.dishcopy.comments.push(this.commentForm.value);
    this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
      
    this.commentForm.reset();
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
        if (control.errors.hasOwnProperty(key)) {
          this.formErrors[field] += messages[key] + ' ';
        }
        }
      }
      }
    }
    }

}
