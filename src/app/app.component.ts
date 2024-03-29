import { OnInit, OnDestroy, Component } from "@angular/core"
import { Router, ActivatedRoute, Params } from "@angular/router"
import lzw from "node-lzw"
import Instruments from "webaudio-instruments"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // notes
  // 3 instruments, 13 beats - 3 percussion, 5 bass, 5 melody
  notes = []
  // beats are made up of notes
  beats = []
  // a measure is made up of rows of beats
  measures = []
  // a bar is made up of measures
  bars = []

  paused = true

  totalNotes = 4*4*4*13

  player = new Instruments()

  inDev = false

  constructor(private activatedRoute: ActivatedRoute) {
    console.log("Mandachord warming up")

    // subscribe to router event
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      // copies the song code in the URL and makes it the main song code
      this.songCode = params['song'];
      if(this.songCode) {
        this.decodeURL()
      }
    })

    this.setupMandachrod()
  }

  songCode = ""

  /*
    Returns the song code wrapped with HTTP protocol and local domain

    @returns {String} Formatted URL
  **/
  getSongURL() {
    return `${location.protocol}//${window.location.host}?song=${this.songCode}`
  }


  /*
    Setup the main bars array with a new one
  **/
  setupMandachrod() {
    this.bars = this.returnBars()
  }

  /*
    Returns a new array of notes

    @returns {Array} New notes
  **/
  returnNotes() {
    let notes = []
    for(let i=0; i<13; i++) {
      notes.push(false)
    }
    return notes
  }

  /*
    Returns a new array of beats, with notes

    @returns {Array} New beats, with notes
  **/
  returnBeats() {
    let beats = []
    for(let i=0; i<4; i++) {
      beats.push(this.returnNotes())
    }
    return beats
  }

  /*
    Returns a new array of measures, with beats and notes

    @returns {Array} New measures, with beats and notes
  **/
  returnMeasures() {
    let measures = []
    for(let i=0; i<4; i++) {
      measures.push(this.returnBeats())
    }
    return measures
  }

  /*
    Returns a new array of bars, with measures, beats and notes

    @returns {Array} New bars, with measures, beats and notes
  **/
  returnBars() {
    let bars = []
    for(let i=0; i<4; i++) {
      bars.push(this.returnMeasures())
    }
    return bars
  }

  /*
    Encodes the song code to be used in the shareable URL
  **/
  encodeURL() {
    this.songCode = this.compressThis(this.bars)
  }

  /*
    Decodes the song code from the URL
  **/
  decodeURL() {
    this.bars = this.decompressThis(this.songCode)
  }

  /*
    Simple function to log whatever comes in

    @param {Object} obj - anything
  **/
  print(obj) {
    console.log(obj)
  }

  /*
    Events to be done when a beat is clicked

    @param {Event} event - Angular DOM event
  **/
  toggleNote(event) {
    let id = event.target.id
    let idl = id.length

    // finds the beat in the sepearate arrays
    let barMatch = parseInt(`${id[idl-8]}${id[idl-7]}`)
    let measureMatch = parseInt(`${id[idl-6]}${id[idl-5]}`)
    let beatMatch = parseInt(`${id[idl-4]}${id[idl-3]}`)
    let noteMatch = parseInt(`${id[idl-2]}${id[idl-1]}`)

    // check if the current bar has reached the maximum amount
    // of the incoming type of note and disables turning it on
    if(!this.barLimitReached([barMatch-1,measureMatch-1,beatMatch-1,noteMatch-1])
        || this.bars[barMatch-1][measureMatch-1][beatMatch-1][noteMatch-1]) {

      // toggles the true/false for the particular beat in the array
      this.bars[barMatch-1][measureMatch-1][beatMatch-1][noteMatch-1]
      = !this.bars[barMatch-1][measureMatch-1][beatMatch-1][noteMatch-1]

      // play the note if being toggled on
      if(this.bars[barMatch-1][measureMatch-1][beatMatch-1][noteMatch-1]) {
        this.playNote(noteMatch-1)
      }

      // refresh the shareable URL everytime a beat is toggled
      this.encodeURL()
    }
  }

  percussionLimit = 26
  bassLimit = 16
  melodyLimit = 16

  /*
    Checks to see if the incoming note's ID number is in a bar that is at its limit
    and is about to exceed it

    @param {Array} incoming - the note's ID numbers (bars, measure, beat, note)
    @returns {Boolean} bar has reached maximum number of that type of note
  **/
  barLimitReached(incoming) {
    let notes = {
      percussion: 0,
      bass: 0,
      melody: 0
    }

    let bar = this.bars[incoming[0]]

    // loops through the selected bar, checking for notes that are on
    // increments percussion number if between 0 and 3
    // increments base number if between 3 and 7
    // increments melody number if between 8 and 12
    for(let i=0;i<bar.length;i++) { // bar of measures
      for(let j=0;j<bar[i].length;j++) { // measure of beats
        for(let k=0;k<bar[i][j].length;k++) { // beat of notes
          if(bar[i][j][k]) {
            if(k > -1 && k < 3) {
              notes.percussion++
            } else
            if(k > 2 && k < 8) {
              notes.bass++
            } else
            if(k > 7 && k < 13) {
              notes.melody++
            }
          }
        }
      }
    }

    // returns true if any of the limits are exceeded
    // with a custom error for each instrument
    if((incoming[3] > -1 && incoming[3] < 3)
        && (notes.percussion + 1) > this.percussionLimit) {
      // error message here
      return true
    } else
    if((incoming[3] > 2 && incoming[3] < 8)
        && (notes.bass + 1) > this.bassLimit) {
      // error message here
      return true
    } else
    if((incoming[3] > 7 && incoming[3] < 13)
        && (notes.melody + 1) > this.melodyLimit) {
      // error message here1
      return true
    }

    return false
  }

  /*
    Checks if a note is on, in the array, with a given ID (structure: '<instrument><bar#><#measure#><beat#><note#>')

    @param {String} id - ID of DOM note
    @returns {Boolean} if note is on or not
  **/
  isNoteOn(id) {
    let idl = id.length

    let barMatch = parseInt(`${id[idl-8]}${id[idl-7]}`)
    let measureMatch = parseInt(`${id[idl-6]}${id[idl-5]}`)
    let beatMatch = parseInt(`${id[idl-4]}${id[idl-3]}`)
    let noteMatch = parseInt(`${id[idl-2]}${id[idl-1]}`)

    return this.bars[barMatch-1][measureMatch-1][beatMatch-1][noteMatch-1]
  }

  noteFreq = 440
  /*
    Changes the frequency to test, when the user lifts a key

    @param {Event} Angular DOM event
  **/
  changeFreq(event) {
    this.noteFreq = event.target.value
  }

  percussionInstrument = "beta"
  bassInstrument = "druk"
  melodyInstrument = "gamma"

  masterVolume = 0.5
  percussionInstrument1No = 128
  percussionInstrument2No = 147
  percussionInstrument3No = 171
  percussionVolume = 1
  percussionInstrumentFreq = [72,300,200]
  bassInstrumentNo = 51
  bassVolume = 1
  bassInstrumentFreq = [35,37,40,43,45]
  melodyInstrumentNo = 96
  melodyVolume = 1
  melodyInstrumentFreq = [40,42,45,48,50]

  /*
    Play a specific note

    @param {Number} note - the note to play
  **/
  playNote(note) {
    // switch to determine which sound should be played, depending on the note number (0-2 percussion, 3-7 bass, 8-12 melody)
    switch(note) {
      case 0:
        this.playInstrument(
          this.percussionInstrument1No,
          this.percussionInstrumentFreq[2],
          this.percussionVolume*this.masterVolume,
          0,0.2) // perc
        break
      case 1:
        this.playInstrument(
          this.percussionInstrument2No,
          this.percussionInstrumentFreq[1],
          this.percussionVolume*this.masterVolume,
          0,0.2) // perc
        break
      case 2:
      if(this.percussionInstrument === "beta") {
        this.playInstrument(
          this.percussionInstrument3No,
          this.percussionInstrumentFreq[0],
          (this.percussionVolume*this.masterVolume)/2,
          0,0.2) // perc
      } else {
        this.playInstrument(
          this.percussionInstrument3No,
          this.percussionInstrumentFreq[0],
          this.percussionVolume*this.masterVolume,
          0,0.2) // perc
      }
        break
      case 3:
        this.playInstrument(
          this.bassInstrumentNo,
          this.bassInstrumentFreq[4],
          this.bassVolume*this.masterVolume,
          0,0.2) // bass
        break
      case 4:
        this.playInstrument(
          this.bassInstrumentNo,
          this.bassInstrumentFreq[3],
          this.bassVolume*this.masterVolume,
          0,0.2) // bass
        break
      case 5:
        this.playInstrument(
          this.bassInstrumentNo,
          this.bassInstrumentFreq[2],
          this.bassVolume*this.masterVolume,
          0,0.2) // bass
        break
      case 6:
        this.playInstrument(
          this.bassInstrumentNo,
          this.bassInstrumentFreq[1],
          this.bassVolume*this.masterVolume,
          0,0.2) // bass
        break
      case 7:
        this.playInstrument(
          this.bassInstrumentNo,
          this.bassInstrumentFreq[0],
          this.bassVolume*this.masterVolume,
          0,0.2) // bass
        break
      case 8:
        this.playInstrument(
          this.melodyInstrumentNo,
          this.melodyInstrumentFreq[4],
          this.melodyVolume*this.masterVolume,
          0,0.2) // melody
        break
      case 9:
        this.playInstrument(
          this.melodyInstrumentNo,
          this.melodyInstrumentFreq[3],
          this.melodyVolume*this.masterVolume,
          0,0.2) // melody
        break
      case 10:
        this.playInstrument(
          this.melodyInstrumentNo,
          this.melodyInstrumentFreq[2],
          this.melodyVolume*this.masterVolume,
          0,0.2) // melody
        break
      case 11:
        this.playInstrument(
          this.melodyInstrumentNo,
          this.melodyInstrumentFreq[1],
          this.melodyVolume*this.masterVolume,
          0,0.2) // melody
        break
      case 12:
        this.playInstrument(
          this.melodyInstrumentNo,
          this.melodyInstrumentFreq[0],
          this.melodyVolume*this.masterVolume,
          0,0.2) // melody
        break
    }
  }

  instruInst = 0
  instruFreq = 72
  instruVelo = 0.5
  instruDela = 0
  instruDura = 0.2

  playInstrument(instrument, freq, velocity, delay, duration) {
    this.player.play(
      instrument,        // instrument: 24 is "Acoustic Guitar (nylon)"
      freq,        // note: midi number or frequency in Hz (if > 127)
      velocity,       // velocity: 0..1
      delay,         // delay in seconds
      duration        // duration in seconds
    )
  }

  setReverb(reverb) {
    this.player._synth.setReverbLev(reverb)
  }

  prevInstru() {
    this.instruInst--
    this.playInstrument(this.instruInst,this.instruFreq,this.instruVelo,this.instruDela,this.instruDura)
  }
  nextInstru() {
    this.instruInst++
    this.playInstrument(this.instruInst,this.instruFreq,this.instruVelo,this.instruDela,this.instruDura)
  }

  /*
    Plays the notes in a linear sequence
  **/
  playSoundsLinear() {
    let note = 1
    let beat = 1
    let measure = 1
    let bar = 1

    // make sure it doesn't play while it's playing
    if(this.paused) {
      this.paused = false

      // plays the notes in the array, starting at 1,1,1,1
      this.iterateNotes(bar, measure, beat, note)
    }
  }

  barPlaying = 1
  measurePlaying = 1
  beatPlaying = 1
  notePlaying = 1

  /*
    Resets the playback back to the start
  **/
  resetPlayback() {
    this.barPlaying = this.loopStartBar
    this.measurePlaying = 1
    this.beatPlaying = 1
    this.notePlaying = 1
  }

  loopStartBar = 1
  loopEndBar = 4

  /*
    Iterates over the notes while unpaused

    @param {Number} bar - bar to play
    @param {Number} measure - measure to play
    @param {Number} beat - beat to play
    @param {Number} note - note to play
  **/
  iterateNotes(bar, measure, beat, note) {

    // pauses playback if playing
    if(!this.paused) {

      //sets up a timeout to allow space between beats being played
      setTimeout(() => {

        // if the current beat is "on", play a sound
        if(this.bars[this.barPlaying-1][this.measurePlaying-1][this.beatPlaying-1][this.notePlaying-1]) {

          this.playNote(note-1)
        }

        // increment note
        this.notePlaying++

        // if note exceeds threshold, reset it
        // increment beat
        if(this.notePlaying>13) {
          this.notePlaying=1
          this.beatPlaying++
        }

        // if beat exceeds threshold, reset it
        // increment measure
        if(this.beatPlaying>4) {
          this.beatPlaying=1
          this.measurePlaying++
        }

        // if measure exceeds threshold, reset it
        // increment bar
        if(this.measurePlaying>4) {
          this.measurePlaying=1
          this.barPlaying++
        }

        // if bar exceeds threshold, reset it
        // this also resets the song to the start
        if(this.barPlaying>this.loopEndBar) {
          this.barPlaying=this.loopStartBar
        }

        // recursively call this function to play the next note
        this.iterateNotes(this.barPlaying, this.measurePlaying, this.beatPlaying, this.notePlaying)

      }, this.playbackBeatGap)
    }
  }

  playbackBeatGap = 8

  loopCheck() {
    if(this.loopEndBar < this.loopStartBar) {
      this.loopEndBar = this.loopStartBar
    }
  }

  /*
    Gets the total number of beats that have been played

    @returns {Number} total beats played
  **/
  getBeatsPlayed() {
    return ((
      ((this.barPlaying-1)*4*4*13)+
      ((this.measurePlaying-1)*4*13)+
      ((this.beatPlaying-1)*13)+
      (this.notePlaying-1)
    ))
  }

  /*
    Gets the trackbar rotation as a number

    @returns {Number} rotation
  **/
  getTrackBarRot() {
    let rotation = ((this.getBeatsPlayed())/this.totalNotes)*360
    return rotation
  }

  /*
    Gets the trackbar rotation as a string ready for use as a CSS transform

    @returns {String} Rotation as a CSS transform
  **/
  getTrackBarRotStr() {
    let rotStr = `rotate(${this.getTrackBarRot()-90}deg)`
    return rotStr
  }

  /*
    Compresses the input (bars array) into a short string
    Max length of ~240 characters (song code)

    @param {Array} uncompressed - the bars array to be compressed
    @returns {String} The compressed string
  **/
  compressThis(uncompressed) {
    let compressed = ""

    let note = 1
    let beat = 1
    let measure = 1
    let bar = 1

    let combo = 0
    let comboType = false

    // sets up the combo to start with the first note's type (true/false)
    comboType = this.bars[0][0][0][0]

    // loops through all the notes in that bars array
    for(let i=0;i<this.totalNotes;i++) {

      // if the current note doesn't match the current combo's type,
      // add a letter and number representing the type and chain length
      // to the compressed array (first pass)
      if(comboType != this.bars[bar-1][measure-1][beat-1][note-1]) {

        // differentiate what the type is
        if(comboType) {
          compressed += `t${combo}`
        } else {
          compressed += `f${combo}`
        }

        // reset combo, change combo type to the current note's type
        combo = 0
        comboType = this.bars[bar-1][measure-1][beat-1][note-1]
      }

      // increment combo, will always be at least 1
      combo++

      // increment note
      note++;

      // if note exceeds threshold, reset it
      // increment beat
      if(note>13) {
        note=1
        beat++
      }

      // if beat exceeds threshold, reset it
      // increment measure
      if(beat>4) {
        beat=1
        measure++
      }

      // if measure exceeds threshold, reset it
      // increment bar
      if(measure>4) {
        measure=1
        bar++
      }

      // if bar exceeds threshold, reset it (for safety)
      if(bar>4) {
        bar=1
      }
    }

    // add the final combo to the string
    if(comboType) {
      compressed += `t${combo}`
    } else {
      compressed += `f${combo}`
    }

    // do the second pass of the compression
    compressed = this.replacePass(compressed, false)

    return compressed
  }

  /*
    Second pass of compression, first pass of decompression

    @param {String} input - the string to compress or decompress
    @param {Boolean} decompressing - whether to compress or decompress
    @returns {String} compressed or decompressed string
  **/
  replacePass(input, decompressing) {
    let output = ""

    // checks to see if we're compressing or decompressing
    if(decompressing) {

      // decode the lzw-encoded string
      output = lzw.decode(input)

      // replace various shortenings with the long versions
      output = output.replace(/m/g, "lh") // ftf
                     .replace(/l/g, "hg") // ft
                     .replace(/n/g, "kg") // tft
                     .replace(/k/g, "gh") // tf

                     .replace(/p/g, "f2") // f2, f20-f29
                     .replace(/h/g, "f1") // f1, f10-f19
                     .replace(/o/g, "t2") // t2, t20-t29
                     .replace(/g/g, "t1") // t1, t10-t19

    } else {

      // replace various parts of the first pass with short, 1 character, parts
      output = input.replace(/t1/g, "g") // t1, t10-t19
                    .replace(/t2/g, "o") // t2, t20-t29
                    .replace(/f1/g, "h") // f1, f10-f19
                    .replace(/f2/g, "p") // f2, f20-f29

                    .replace(/gh/g, "k") // tf
                    .replace(/kg/g, "n") // tft
                    .replace(/hg/g, "l") // ft
                    .replace(/lh/g, "m") // ftf

      // encode the string using lzw-encoding
      output = lzw.encode(output)
    }

    return output
  }

  /*
    Decompresses the input (song code) into an array (the bars array)

    @param {Array} uncompressed - the bars array to be compressed
    @returns {String} The compressed string
  **/
  decompressThis(compressed) {

    // do the first pass of the decompression
    compressed = this.replacePass(compressed, true)

    // setup a new bars array to be filled
    let decompressed = this.returnBars()

    let note = 1
    let beat = 1
    let measure = 1
    let bar = 1

    // unravel the first pass decompressed string into a single array of booleans
    let decomPass1 = compressed.split(/(\w\d+)/)
         .filter(i => i)
         .map(v => Array(parseInt(v.substr(1))).fill(v.substr(0, 1) === 't'))
         .reduce((m, a) => m.concat(a), [])

    // loop through the array using the presumed size (fails horribly now, TODO fail gracefully)
    // done purposefully to enforce failure if not expected size
    for(let i=0;i<this.totalNotes;i++) {

      // set new song array note to the value of the decompressed array
      decompressed[bar-1][measure-1][beat-1][note-1] = decomPass1[i]

      // increment note
      note++;

      // if note exceeds threshold, reset it
      // increment beat
      if(note>13) {
        note=1
        beat++
      }

      // if beat exceeds threshold, reset it
      // increment measure
      if(beat>4) {
        beat=1
        measure++
      }

      // if measure exceeds threshold, reset it
      // increment bar
      if(measure>4) {
        measure=1
        bar++
      }

      // if bar exceeds threshold, reset it (for safety)
      if(bar>4) {
        bar=1
      }
    }

    return decompressed
  }

  /*
    Copies the URL to the clipboard
  **/
  copyURL() {
    let listener  = e => {
      e.clipboardData.setData("text/plain", this.getSongURL())
      e.preventDefault()
    }
    document.addEventListener("copy", listener)
    document.execCommand("copy")
    document.removeEventListener("copy", listener)
  }

  loopBar(bar) {
    this.loopBar([bar])
  }

  loopBars(bars) {

  }

  loopMeasure(measure) {
    this.loopMeasures([measure])
  }

  loopMeasures(measures) {

  }

  copyFromBar = "1"
  copyToBar = "2"
  copyBarNoteType = "all"
  /*
    Reacts to the selects for the bar copying
  **/
  doCopyBar() {
    if(this.copyToBar === "all") {
      this.copyBar(this.copyFromBar, [1,2,3,4], this.copyBarNoteType)
    } else {
      this.copyBar(this.copyFromBar, [this.copyToBar], this.copyBarNoteType)
    }
  }

  copyFromMeasureBar = "1"
  copyFromMeasure = "1"
  copyToMeasure = "2"
  copyBarMeasureNoteType = "all"
  /*
    Reacts to the selects for the measure copying
  **/
  doCopyMeasure() {
    if(this.copyToMeasure === "all") {
      this.copyMeasure(this.copyFromMeasureBar, this.copyFromMeasure, [1,2,3,4], this.copyBarMeasureNoteType)
    } else {
      this.copyMeasure(this.copyFromMeasureBar, this.copyFromMeasure, [this.copyToMeasure], this.copyBarMeasureNoteType)
    }
  }

  /*
    Copies the notes from one bar to one other or many others

    @param {Number} from - number of the bar
    @param {Array} to - array of bars to copy to
  **/
  copyBar(from, to, noteType) {
    for (var i=0;i<this.bars[from-1].length;i++) { // measure
      for (var j=0;j<this.bars[from-1][i].length;j++) { // beat
        for (var k=0;k<this.bars[from-1][i][j].length;k++) { // notes
          for (var l=0;l<to.length;l++) {
            if((noteType === "all")
              || (noteType === "percussion" && k>-1 && k<3)
              || (noteType === "bass" && k>2 && k<8)
              || (noteType === "melody" && k>7 && k<13)) {
              this.bars[to[l]-1][i][j][k] = this.bars[from-1][i][j][k]
            }
          }
        }
      }
    }
  }

  /*
    Copies the notes from one measure in a bar to one other or many other measures in that same bar

    @param {Number} bar - number of the bar
    @param {Number} from - number of the measure
    @param {Array} to - array of measures to copy to
  **/
  copyMeasure(bar, from, to, noteType) {
    for (var j=0;j<this.bars[bar-1][from-1].length;j++) { // beat
      for (var k=0;k<this.bars[bar-1][from-1][j].length;k++) { // notes
        for (var l=0;l<to.length;l++) {
          if((noteType === "all")
            || (noteType === "percussion" && k>-1 && k<3)
            || (noteType === "bass" && k>2 && k<8)
            || (noteType === "melody" && k>7 && k<13)) {
            this.bars[bar-1][to[l]-1][j][k] = this.bars[bar-1][from-1][j][k]
          }
        }
      }
    }
  }

  /*
    Randomizes the beats to create a random song
  **/
  randomizeIt() {
    let note = 1
    let beat = 1
    let measure = 1
    let bar = 1

    for(let i=0;i<this.totalNotes;i++) {

      // check if values are below 10 and prepend a 0, if so
      let barStr = bar<10 ? `0${bar}` : bar
      let measureStr = measure<10 ? `0${measure}` : measure
      let beatStr = beat<10 ? `0${beat}` : beat
      let noteStr = note<10 ? `0${note}` : note

      let instrument = "percussion"

      // check what instrument it is
      if(note > -1 && note < 3) {
        instrument = "percussion"
      } else
      if(note > 2 && note < 8) {
        instrument = "bass"
      } else
      if(note > 7 && note < 13) {
        instrument = "melody"
      }

      // randomly toggle the note... or not
      // biased toward not toggling (more likely to be 0), since we have a low limit
      if(Math.round(Math.random()/1.5)) {
        // debugger;
        // fake object it is expecting with our data
        let fakeObject = {
          target: {
            id: `${instrument}${barStr}${measureStr}${beatStr}${noteStr}`
          }
        }
        console.log(fakeObject.target.id)
        this.toggleNote(fakeObject)
      }

      // increment note
      note++;

      // if note exceeds threshold, reset it
      // increment beat
      if(note>13) {
        note=1
        beat++
      }

      // if beat exceeds threshold, reset it
      // increment measure
      if(beat>4) {
        beat=1
        measure++
      }

      // if measure exceeds threshold, reset it
      // increment bar
      if(measure>4) {
        measure=1
        bar++
      }

      // if bar exceeds threshold, reset it (for safety)
      if(bar>4) {
        bar=1
      }
    }
  }
}
