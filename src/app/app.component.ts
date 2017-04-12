import { OnInit, OnDestroy, Component } from "@angular/core"
import { Router, ActivatedRoute, Params } from "@angular/router"
import lzw from "node-lzw"

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
  toggleBeat(event) {
    let id = event.target.id
    let idl = id.length

    // finds the beat in the sepearate arrays
    let barMatch = parseInt(`${id[idl-8]}${id[idl-7]}`)
    let measureMatch = parseInt(`${id[idl-6]}${id[idl-5]}`)
    let beatMatch = parseInt(`${id[idl-4]}${id[idl-3]}`)
    let noteMatch = parseInt(`${id[idl-2]}${id[idl-1]}`)

    // toggles the true/false for the particular beat in the array
    this.bars[barMatch-1][measureMatch-1][beatMatch-1][noteMatch-1]
    = !this.bars[barMatch-1][measureMatch-1][beatMatch-1][noteMatch-1]

    // refresh the shareable URL everytime a beat is toggled
    this.encodeURL()
  }

  /*
    Checks if a note is on, in the array, with a given ID (structure: '<instrument><bar#><#measure#><beat#><note#>')

    @param {String} id - ID of DOM note
    @returns {Boolean}
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

  context = new (AudioContext)();
  osc = this.context.createOscillator() // instantiate an oscillator

  /*
    Play a note of a specific frequency

    @param {Number} freq - the frequency
  **/
  playNote(freq) {
    // instantiate an oscillator
    this.osc = this.context.createOscillator()

    // this is the default - also square, sawtooth, triangle
    this.osc.type = 'sine'
    this.osc.frequency.value = freq

    // connect it to the destination
    this.osc.connect(this.context.destination)

    // start the oscillator
    this.osc.start()

    // stop the oscillator after 0.2 seconds
    this.osc.stop(this.context.currentTime + 0.2)
  }

  /*
    Stops the oscillator
  **/
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


  /*
    Sets up the frequencies for the 12 notes
  **/
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

  /*
    Plays the notes in a linear sequence
  **/
  playSoundsLinear() {
    let note = 1
    let beat = 1
    let measure = 1
    let bar = 1

    // sets the frequencies
    this.setupSounds()

    // plays the notes in the array, starting at 1,1,1,1
    this.iterateNotes(bar, measure, beat, note)
  }

  beatsPlayed = 0
  barPlaying = 1
  measurePlaying = 1
  beatPlaying = 1
  notePlaying = 1

  /*
    Resets the playback back to the start
  **/
  resetPlayback() {
    this.beatsPlayed = 0
    this.barPlaying = 1
    this.measurePlaying = 1
    this.beatPlaying = 1
    this.notePlaying = 1
  }

  /*
    Iterates over the notes while unpaused

    @param {Number} bar - bar to play
    @param {Number} measure - measure to play
    @param {Number} beat - beat to play
    @param {Number} note - note to play
  **/
  iterateNotes(bar, measure, beat, note) {

    // pauses playback if paused
    if(!this.paused) {

      //sets up a timeout to allow space between beats being played
      setTimeout(() => {

        // if the current beat is "on", play a sound
        if(this.bars[this.barPlaying-1][this.measurePlaying-1][this.beatPlaying-1][this.notePlaying-1]) {

          // switch to determine which sound should be played, depending on the note number (0-2 percussion, 3-7 bass, 8-12 melody)
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
        if(this.barPlaying>4) {
          this.barPlaying=1
        }

        // increment the number of beats played, currently used for trackbar rotation
        ++this.beatsPlayed

        // if total beats played exceeds total notes(832), reset it
        if(this.beatsPlayed > this.totalNotes) {
          this.beatsPlayed = 0
        }

        // recursively call this function to play the next note
        this.iterateNotes(this.barPlaying, this.measurePlaying, this.beatPlaying, this.notePlaying)

      }, 15)
    }
  }

  /*
    Gets the trackbar rotation as a number

    @returns {Number} rotation
  **/
  getTrackBarRot() {
    let rotation = (this.beatsPlayed/this.totalNotes)*360
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

  /*
    Randomizes the beats to create a random song
  **/
  randomizeIt() {
    let note = 1
    let beat = 1
    let measure = 1
    let bar = 1

    for(let i=0;i<this.totalNotes;i++) {

      this.bars[bar-1][measure-1][beat-1][note-1] = Math.round(Math.random())

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
