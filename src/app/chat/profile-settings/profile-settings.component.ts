import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnInit {

  avatarUrl = "https://randomuser.me/api/portraits/men/43.jpg";
  name = "John Doe";

  constructor() { }

  ngOnInit() {
  }

}
