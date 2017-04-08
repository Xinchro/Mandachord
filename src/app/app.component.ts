import { OnInit, OnDestroy, Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // beats
  tones = []
  // 3 instruments, 13 beats - 3 percussion, 5 bass, 5 melody
  // beat rows are made up of the instruments' beats
  beats = []
  // a measure is made up of rows of beats from instruments
  measures = []
  // a bar is made up of measures
  bars = []

  constructor(private activatedRoute: ActivatedRoute) {
    console.log("Mandachord warming up")
    this.setupMandachrod()

    // subscribe to router event
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.songCode = params['song'];
      if(this.songCode) {
        // console.log(this.songCode);
        console.log(window.location.href)
        this.decodeURL()
      }
    });
  }

  songCode = ""

  getSongURL() {
    return `${location.protocol}//${window.location.host}?song=${this.songCode}`
  }

  setupMandachrod() {
    this.bars = this.returnBars()
  }

  returnTones() {
    let tones = []
    for(let i=0; i<13; i++) {
      tones.push(false)
    }
    return tones
  }

  returnBeats() {
    let beats = []
    for(let i=0; i<4; i++) {
      beats.push(this.returnTones())
    }
    return beats
  }

  returnMeasures() {
    let measures = []
    for(let i=0; i<4; i++) {
      measures.push(this.returnBeats())
    }
    return measures
  }

  returnBars() {
    let bars = []
    for(let i=0; i<4; i++) {
      bars.push(this.returnMeasures())
    }
    return bars
  }

  encodeURL() {
    this.songCode = btoa(JSON.stringify(this.bars))
  }

  decodeURL() {
    this.bars = JSON.parse(atob(this.songCode))
    console.log(this.bars)
  }

  print(obj) {
    console.log(obj)
  }

  toggleBeat(event) {
    console.log("toggling beat")

    let id = event.target.id
    let idl = id.length

    let barMatch = parseInt(`${id[idl-8]}${id[idl-7]}`)
    let measureMatch = parseInt(`${id[idl-6]}${id[idl-5]}`)
    let beatMatch = parseInt(`${id[idl-4]}${id[idl-3]}`)
    let toneMatch = parseInt(`${id[idl-2]}${id[idl-1]}`)

    this.bars[barMatch-1][measureMatch-1][beatMatch-1][toneMatch-1]
    = !this.bars[barMatch-1][measureMatch-1][beatMatch-1][toneMatch-1]

    this.encodeURL()

  }


  isToneOn(id) {
    let idl = id.length

    let barMatch = parseInt(`${id[idl-8]}${id[idl-7]}`)
    let measureMatch = parseInt(`${id[idl-6]}${id[idl-5]}`)
    let beatMatch = parseInt(`${id[idl-4]}${id[idl-3]}`)
    let toneMatch = parseInt(`${id[idl-2]}${id[idl-1]}`)

    return this.bars[barMatch-1][measureMatch-1][beatMatch-1][toneMatch-1]
  }

  toneFreq = 440
  changeFreq(event) {
    this.toneFreq = event.target.value
  }

  context = new (AudioContext)();
  osc = this.context.createOscillator(); // instantiate an oscillator

  playTone(freq) {
    this.osc = this.context.createOscillator(); // instantiate an oscillator
    this.osc.type = 'sine'; // this is the default - also square, sawtooth, triangle
    // this.osc.frequency.value = this.toneFreq; // Hz
    this.osc.frequency.value = freq; // Hz
    this.osc.connect(this.context.destination); // connect it to the destination
    this.osc.start(); // start the oscillator
    this.osc.stop(this.context.currentTime + 0.2);
  }

  stopTone() {
    this.osc.stop();
  }

  perc1Sound = 100
  perc2Sound = 100
  perc3Sound = 100
  bass1Sound = 100
  bass2Sound = 100
  bass3Sound = 100
  bass4Sound = 100
  bass5Sound = 100
  melody1Sound = 100
  melody2Sound = 100
  melody3Sound = 100
  melody4Sound = 100
  melody5Sound = 100

  setupSounds() {
    // percussion
    // 200-300

    this.perc1Sound = 233
    this.perc2Sound = 266
    this.perc3Sound = 299

    // bass
    // 100-200

    this.bass1Sound = 110
    this.bass2Sound = 130
    this.bass3Sound = 150
    this.bass4Sound = 170
    this.bass5Sound = 190

    // melody
    // 300-400

    this.melody1Sound = 310
    this.melody2Sound = 330
    this.melody3Sound = 350
    this.melody4Sound = 370
    this.melody5Sound = 390
  }

  playSoundsLinear() {
    let totalNotes = 4*4*4*13
    let tone = 1
    let beat = 1
    let measure = 1
    let bar = 1
    this.setupSounds()

    this.iterateNotes(totalNotes, bar, measure, beat, tone)

  }

  iterateNotes(i, bar, measure, beat, tone) {
    if (i <= 0) return;

    setTimeout(() => {

      if(this.bars[bar-1][measure-1][beat-1][tone-1]) {
        // console.log(`playing note ${[bar-1,measure-1,beat-1,tone-1]}`)
        switch(tone-1) {
          case 0:
            this.playTone(this.perc1Sound)
            break
          case 1:
            this.playTone(this.perc2Sound)
            break
          case 2:
            this.playTone(this.perc3Sound)
            break
          case 3:
            this.playTone(this.bass1Sound)
            break
          case 4:
            this.playTone(this.bass2Sound)
            break
          case 5:
            this.playTone(this.bass3Sound)
            break
          case 6:
            this.playTone(this.bass4Sound)
            break
          case 7:
            this.playTone(this.bass5Sound)
            break
          case 8:
            this.playTone(this.melody1Sound)
            break
          case 9:
            this.playTone(this.melody2Sound)
            break
          case 10:
            this.playTone(this.melody3Sound)
            break
          case 11:
            this.playTone(this.melody4Sound)
            break
          case 12:
            this.playTone(this.melody5Sound)
            break
        }
      } else {
      }
      tone++;
      if(tone>13) {
        tone=1
        beat++
      }
      if(beat>4) {
        beat=1
        measure++
      }
      if(measure>4) {
        measure=1
        bar++
      }
      if(bar>4) {
        bar=1
      }

      this.iterateNotes(--i, bar, measure, beat, tone);

    }, 15);
  }
}
