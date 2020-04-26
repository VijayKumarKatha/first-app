import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
//import { ScrollingModule } from '@angular/cdk/scrolling';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(public dialog: MatDialog ) { }

  ngOnInit(): void {
  }

  openLoginForm(){
    this.dialog.open(LoginComponent, {width: '1000px', height: '950px'});
  }

}
