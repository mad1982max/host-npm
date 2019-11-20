import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { vcog2d } from 'vcog2d';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    vcog2d
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
