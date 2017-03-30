import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // beats
  beats = []
  // 3 instruments, 13 beats - 3 percussion, 5 bass, 5 melody
  // beat rows are made up of the instruments' beats
  beatRows = []
  // a measure is made up of rows of beats from instruments
  measures = []
  // a bar is made up of measures
  bars = []

  // beatrow rotation
  rot=0

  constructor() {
    console.log("Mandachord warming up")
    this.setupMandachrod()
  }

  setupMandachrod() {
    for(let i=0; i<13; i++) {
      this.beats.push(false)
    }
    for(let i=0; i<4; i++) {
      this.beatRows.push(this.beats)
    }
    for(let i=0; i<4; i++) {
      this.measures.push(this.beatRows)
    }
    for(let i=0; i<4; i++) {
      this.bars.push(this.measures)
    }
    // console.log(this.bars)
  }

  print(obj) {
    console.log(obj)
  }

  rotateRow() {
    let degs = 5.625*this.rot
    this.rot++
    return `rotate(${degs}deg)`
  }
}
