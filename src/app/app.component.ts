import { Component, ViewChild } from '@angular/core';

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

  constructor() {
    console.log("Mandachord warming up")
    this.setupMandachrod()
  }

  setupMandachrod() {
    // for(let i=0; i<13; i++) {
    //   this.tones.push(false)
    // }
    // for(let i=0; i<4; i++) {
    //   this.beats.push(this.tones.slice(0))
    // }
    // // for(let i=0; i<1; i++) {
    // for(let i=0; i<4; i++) {
    //   this.measures.push(this.beats.slice(0))
    // }
    // // for(let i=0; i<1; i++) {
    // for(let i=0; i<4; i++) {
    //   this.bars.push(this.measures.slice(0))
    // }
    // console.log(this.bars)
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

  print(obj) {
    console.log(obj)
  }

  rotateBar(index) {
    let degs = (90*index)//-45
    switch(index) {
      case 0:
        degs = -90
        break
      case 1:
        degs = 0
        break
      case 2:
        degs = 180
        break
      case 3:
        degs = 90
        break
    }
    // this.barRot++
    return {'transform': `rotate(${degs}deg)`}
  }

  rotateMeasure(index) {
    // let degs = 22.5*index//+(22.5+(22.5/2))
    let degs = 22.5*index//-(22.5/2)
    let orig = [50, 100]

    orig[1] = 100// + 27.7414819157

    switch(index) {
      case 0:
        // orig[0] = 250
        orig[0] = 135
        orig[1] = 105
        break
      case 1:
        // orig[0] = 150
        orig[0] = 100
        orig[1] = 100
        break
      case 2:
        // orig[0] = -50
        orig[0] = 0
        orig[1] = 100
        break
      case 3:
        // orig[0] = -150
        orig[0] = -35
        orig[1] = 105
        break
    }

    // if(this.measureRot <4) {
    //   this.measureRot++
    // } else {
    //   this.measureRot = 0
    // }
    // return {'transform': `rotate(${degs}deg)`, 'transform-origin': `${orig[0]}% ${orig[1]}%`}
    return {'transform': `rotate(${degs}deg)`}
  }

  rotateRow(index) {
    // let degs = 5.625*index
    // if(this.rowRot <4) {
    //   this.rowRot++
    // } else {
    //   this.rowRot = 0
    // }
    // return `rotate(${degs}deg)`
    let degs = 5.625*index//-(5.625+(5.625/2))
    let orig = [50, 100]

    switch(index) {
      case 0:
        // orig[0] = 250
        orig[0] = 200
        break
      case 1:
        // orig[0] = 150
        orig[0] = 100
        break
      case 2:
        // orig[0] = -50
        orig[0] = 0
        break
      case 3:
        // orig[0] = -150
        orig[0] = -100
        break
    }

    // orig[0] = 50
    // orig[1] = 100 + 27.7414819157

    // if(this.measureRot <4) {
    //   this.measureRot++
    // } else {
    //   this.measureRot = 0
    // }
    return {'transform': `rotate(${degs}deg)`, 'transform-origin': `${orig[0]}% ${orig[1]}%`}
  }

  thing() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
       if (this.readyState == 4 && this.status == 200) {
           myFunction(this);
       }
    };
    xhttp.open("GET", "../assets/mandachordv2.svg", true);
    xhttp.send();

    function myFunction(xml) {
        var xmlDoc, txt;
        xmlDoc = xml.responseXML;
        // console.log(xmlDoc);
        txt = "";
        let strokes = xmlDoc.getElementById(`strokes`).children
          // console.log(xmlDoc.getElementById(`path2`))
        // console.dir(strokes);
        let bar=1
        let measure=1
        let beat=1
        let tone=1
        for (var i = 0; i < strokes.length; i++) {
          // if(xmlDoc.getElementById(`path${i}`)) {
            // console.log(xmlDoc.getElementById(`path${i}`))
            // xmlDoc.getElementById(`path${i}`).setAttribute('id', `beat${i/2}`)
            let sbar = ""
            let smeasure = ""
            let sbeat = ""
            let stone = ""
            let type = ""
            if(bar<10) {
              sbar = `0${bar}`
            }else{
              sbar=`${bar}`
            }
            if(measure<10) {
              smeasure = `0${measure}`
            }else{
              smeasure=`${measure}`
            }
            if(beat<10) {
              sbeat = `0${beat}`
            }else{
              sbeat=`${beat}`
            }
            if(tone<10) {
              stone = `0${tone}`
            }else{
              stone=`${tone}`
            }
            if(tone<4) {
              type = "percussion"
            } else if(tone>3&&tone<9) {
              type = "bass"
            } else {
              type = "melody"
            }

            xmlDoc.getElementById(`strokes`).children[i].setAttribute('id', `${type}${sbar}${smeasure}${sbeat}${stone}`)
            xmlDoc.getElementById(`strokes`).children[i].setAttribute('class', `${type} beat`)
            tone++;
            if(tone>13) {
              tone=1
              beat++
              // console.log([x,y])
            }
            if(beat>4) {
              beat=1
              measure++
              // console.log([x,y])
            }
            if(measure>4) {
              measure=1
              bar++
              // console.log([tone,beat,measure,bar])
            }
          // }
        }
        // strokes = xmlDoc.getElementById(`strokes`)
        // console.dir(strokes);
        // console.dir(xmlDoc.getElementById(`strokes`).childNodes);
        let serialized = (new XMLSerializer()).serializeToString(xmlDoc)
        // console.log(serialized);
        // x = xmlDoc.getElementsByTagName('title');
        // // Add a new attribute to each title element
        // for (i = 0; i < x.length; i++) {
        //     x[i].setAttribute("edition", "first");
        // }
        // // Output titles and edition value
        // for (i = 0; i < x.length; i++) {
        //     txt += x[i].childNodes[0].nodeValue +
        //     " - Edition: " +
        //     x[i].getAttribute('edition') + "<br>";
        // }
        document.getElementById("xmlout").innerHTML = serialized;
    }
  }

  toggleBeat(event) {
    console.log("toggling beat")

    let id = event.originalTarget.id
    let idl = id.length

    let barMatch = parseInt(`${id[idl-8]}${id[idl-7]}`)
    let measureMatch = parseInt(`${id[idl-6]}${id[idl-5]}`)
    let beatMatch = parseInt(`${id[idl-4]}${id[idl-3]}`)
    let toneMatch = parseInt(`${id[idl-2]}${id[idl-1]}`)

    this.bars[barMatch-1][measureMatch-1][beatMatch-1][toneMatch-1]
    = !this.bars[barMatch-1][measureMatch-1][beatMatch-1][toneMatch-1]

    // this.toggleClass(id, this.bars[barMatch-1][measureMatch-1][beatMatch-1][toneMatch-1])

    console.log(this.bars)
  }

  // toggleClass(ID, bool) {
  //   @ViewChild(ID) id;

  //   if(bool) {
  //     id.addClass("active")
  //   } else {
  //     id.removeClass("active")
  //   }
  // }

  isToneOn(id) {
    let idl = id.length

    let barMatch = parseInt(`${id[idl-8]}${id[idl-7]}`)
    let measureMatch = parseInt(`${id[idl-6]}${id[idl-5]}`)
    let beatMatch = parseInt(`${id[idl-4]}${id[idl-3]}`)
    let toneMatch = parseInt(`${id[idl-2]}${id[idl-1]}`)

    return this.bars[barMatch-1][measureMatch-1][beatMatch-1][toneMatch-1]
  }
}
