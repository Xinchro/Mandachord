import { OnInit, OnDestroy, Component } from "@angular/core"
import { Router, ActivatedRoute, Params } from "@angular/router"
import lzw from "node-lzw"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // beats
  notes = []
  // 3 instruments, 13 beats - 3 percussion, 5 bass, 5 melody
  // beat rows are made up of the instruments' beats
  beats = []
  // a measure is made up of rows of beats from instruments
  measures = []
  // a bar is made up of measures
  bars = []

  paused = true

  totalNotes = 4*4*4*13

  constructor(private activatedRoute: ActivatedRoute) {
    console.log("Mandachord warming up")
    this.setupMandachrod()

    // subscribe to router event
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.songCode = params['song'];
      if(this.songCode) {
        // console.log(this.songCode);
        // console.log(window.location.href)
        this.decodeURL()
      }
    })
  }

  songCode = ""

  getSongURL() {
    return `${location.protocol}//${window.location.host}?song=${this.songCode}`
  }

  setupMandachrod() {
    this.bars = this.returnBars()
  }

  returnNotes() {
    let notes = []
    for(let i=0; i<13; i++) {
      // notes.push(false)
      notes.push(0)
    }
    return notes
  }

  returnBeats() {
    let beats = []
    for(let i=0; i<4; i++) {
      beats.push(this.returnNotes())
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
    this.songCode = this.compressThis(this.bars)
    // this.songCode = btoa(JSON.stringify(this.bars))
  }

  decodeURL() {
    this.bars = this.decompressThis(this.songCode)
    // this.bars = JSON.parse(atob(this.songCode))
    // console.log(this.bars)
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
    let noteMatch = parseInt(`${id[idl-2]}${id[idl-1]}`)

    this.bars[barMatch-1][measureMatch-1][beatMatch-1][noteMatch-1]
    = !this.bars[barMatch-1][measureMatch-1][beatMatch-1][noteMatch-1]

    this.encodeURL()

  }

  isNoteOn(id) {
    let idl = id.length

    let barMatch = parseInt(`${id[idl-8]}${id[idl-7]}`)
    let measureMatch = parseInt(`${id[idl-6]}${id[idl-5]}`)
    let beatMatch = parseInt(`${id[idl-4]}${id[idl-3]}`)
    let noteMatch = parseInt(`${id[idl-2]}${id[idl-1]}`)

    return this.bars[barMatch-1][measureMatch-1][beatMatch-1][noteMatch-1]
  }

  noteFreq = 440
  changeFreq(event) {
    this.noteFreq = event.target.value
  }

  context = new (AudioContext)();
  osc = this.context.createOscillator() // instantiate an oscillator

  playNote(freq) {
    this.osc = this.context.createOscillator() // instantiate an oscillator
    this.osc.type = 'sine' // this is the default - also square, sawtooth, triangle
    this.osc.frequency.value = freq // Hz
    this.osc.connect(this.context.destination) // connect it to the destination
    this.osc.start() // start the oscillator
    this.osc.stop(this.context.currentTime + 0.2)
  }

  stopNote() {
    this.osc.stop()
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
    let note = 1
    let beat = 1
    let measure = 1
    let bar = 1
    this.setupSounds()

    this.beatCounter = this.totalNotes
    this.iterateNotes(bar, measure, beat, note)

  }

  beatCounter = 0
  beatsPlayed = 0
  barPlaying = 1
  measurePlaying = 1
  beatPlaying = 1
  notePlaying = 1

  resetPlayback() {
    console.log("track resetting")
    this.beatsPlayed = 0
    this.barPlaying = 1
    this.measurePlaying = 1
    this.beatPlaying = 1
    this.notePlaying = 1
  }

  // iterateNotes() {
  iterateNotes(bar, measure, beat, note) {
    // if (this.beatCounter <= 0) return;

    if(!this.paused) {

      setTimeout(() => {

        if(this.bars[this.barPlaying-1][this.measurePlaying-1][this.beatPlaying-1][this.notePlaying-1]) {
        // if(this.bars[bar-1][measure-1][beat-1][note-1]) {
          // console.log(`playing note ${[bar-1,measure-1,beat-1,note-1]}`)
          switch(note-1) {
            case 0:
              this.playNote(this.perc1Sound)
              break
            case 1:
              this.playNote(this.perc2Sound)
              break
            case 2:
              this.playNote(this.perc3Sound)
              break
            case 3:
              this.playNote(this.bass1Sound)
              break
            case 4:
              this.playNote(this.bass2Sound)
              break
            case 5:
              this.playNote(this.bass3Sound)
              break
            case 6:
              this.playNote(this.bass4Sound)
              break
            case 7:
              this.playNote(this.bass5Sound)
              break
            case 8:
              this.playNote(this.melody1Sound)
              break
            case 9:
              this.playNote(this.melody2Sound)
              break
            case 10:
              this.playNote(this.melody3Sound)
              break
            case 11:
              this.playNote(this.melody4Sound)
              break
            case 12:
              this.playNote(this.melody5Sound)
              break
          }
        } else {
        }
        this.notePlaying++;
        if(this.notePlaying>13) {
          this.notePlaying=1
          this.beatPlaying++
        }
        if(this.beatPlaying>4) {
          this.beatPlaying=1
          this.measurePlaying++
        }
        if(this.measurePlaying>4) {
          this.measurePlaying=1
          this.barPlaying++
        }
        if(this.barPlaying>4) {
          this.barPlaying=1
        }

        --this.beatCounter

        ++this.beatsPlayed
        if(this.beatsPlayed > 832) {
          this.beatsPlayed = 0
        }

        this.iterateNotes(this.barPlaying, this.measurePlaying, this.beatPlaying, this.notePlaying)

      }, 15);
    }
  }

  getTrackBarRot() {
    let rotation = (this.beatsPlayed/this.totalNotes)*360
    return rotation
  }
  getTrackBarRotStr() {
    let rotStr = `rotate(${this.getTrackBarRot()-90}deg)`
    return rotStr
  }

  compressThis(uncompressed) {
    let compressed = ""

    let note = 1
    let beat = 1
    let measure = 1
    let bar = 1

    let combo = 0
    let comboType = false

    comboType = this.bars[0][0][0][0]

    for(let i=0;i<this.totalNotes;i++) {
      if(comboType === this.bars[bar-1][measure-1][beat-1][note-1]) {
      } else {
        if(comboType) {
          compressed += `t${combo}`
        } else {
          compressed += `f${combo}`
        }
        combo = 0
        comboType = this.bars[bar-1][measure-1][beat-1][note-1]
      }

      combo++
      note++;
      if(note>13) {
        note=1
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
    }
    if(comboType) {
      compressed += `t${combo}`
    } else {
      compressed += `f${combo}`
    }

    compressed = this.replacePass(compressed, false)

    return compressed
  }

  replacePass(input, decompressing) {
    let output = ""

    if(decompressing) {
      output = lzw.decode(input)

      output = output.replace(/m/g, "lh") // ftf
                     .replace(/l/g, "hg") // ft
                     .replace(/n/g, "kg") // tft
                     .replace(/k/g, "gh") // tf

                     .replace(/p/g, "f2") // f2, f20-f29
                     .replace(/h/g, "f1") // f1, f10-f19
                     .replace(/o/g, "t2") // t2, t20-t29
                     .replace(/g/g, "t1") // t1, t10-t19

    } else {
      output = input.replace(/t1/g, "g") // t1, t10-t19
                    .replace(/t2/g, "o") // t2, t20-t29
                    .replace(/f1/g, "h") // f1, f10-f19
                    .replace(/f2/g, "p") // f2, f20-f29

                    .replace(/gh/g, "k") // tf
                    .replace(/kg/g, "n") // tft
                    .replace(/hg/g, "l") // ft
                    .replace(/lh/g, "m") // ftf
      console.log(output)

      output = lzw.encode(output)
    }

    return output
  }

  decompressThis(compressed) {
    compressed = this.replacePass(compressed, true)

    let decompressed = this.returnBars()

    let note = 1
    let beat = 1
    let measure = 1
    let bar = 1

    let combo = 0
    let comboType = false

    let decomPass1 = compressed.split(/(\w\d+)/)
         .filter(i => i)
         .map(v => Array(parseInt(v.substr(1))).fill(v.substr(0, 1) === 't'))
         .reduce((m, a) => m.concat(a), [])

    for(let i=0;i<this.totalNotes;i++) {

      decompressed[bar-1][measure-1][beat-1][note-1] = decomPass1[i]

      note++;
      if(note>13) {
        note=1
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
    }

    console.log(decompressed)
    return decompressed
  }

  copyURL() {
    console.log("copying to clipboard")
    let listener  = e => {
      e.clipboardData.setData("text/plain", this.getSongURL())
      e.preventDefault()
    }
    document.addEventListener("copy", listener)
    document.execCommand("copy")
    document.removeEventListener("copy", listener)
  }

  randomizeIt() {
    let note = 1
    let beat = 1
    let measure = 1
    let bar = 1

    for(let i=0;i<this.totalNotes;i++) {

      this.bars[bar-1][measure-1][beat-1][note-1] = Math.round(Math.random())

      note++;
      if(note>13) {
        note=1
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
    }
  }
}
