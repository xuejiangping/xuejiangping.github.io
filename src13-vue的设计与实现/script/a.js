const MyMath = (function MyMathFactory(Math) {

  const MyMath = {};


  // degree/radian conversion constants
  MyMath.toDeg = 180 / Math.PI;
  MyMath.toRad = Math.PI / 180;
  MyMath.halfPI = Math.PI / 2;
  MyMath.twoPI = Math.PI * 2;

  // Pythagorean Theorem distance calculation
  MyMath.dist = (width,height) => {
    return Math.sqrt(width * width + height * height);
  };

  // Pythagorean Theorem point distance calculation
  // Same as above, but takes coordinates instead of dimensions.
  // The language of this project was translated into Chinese by Nianbroken
  MyMath.pointDist = (x1,y1,x2,y2) => {
    const distX = x2 - x1;
    const distY = y2 - y1;
    return Math.sqrt(distX * distX + distY * distY);
  };

  // Returns the angle (in radians) of a 2D vector
  MyMath.angle = (width,height) => (MyMath.halfPI + Math.atan2(height,width));

  // Returns the angle (in radians) between two points
  // Same as above, but takes coordinates instead of dimensions.
  MyMath.pointAngle = (x1,y1,x2,y2) => (MyMath.halfPI + Math.atan2(y2 - y1,x2 - x1));

  // Splits a speed vector into x and y components (angle needs to be in radians)
  MyMath.splitVector = (speed,angle) => ({
    x: Math.sin(angle) * speed,
    y: -Math.cos(angle) * speed
  });

  // Generates a random number between min (inclusive) and max (exclusive)
  MyMath.random = (min,max) => Math.random() * (max - min) + min;

  // Generates a random integer between and possibly including min and max values
  MyMath.randomInt = (min,max) => ((Math.random() * (max - min + 1)) | 0) + min;

  // Returns a random element from an array, or simply the set of provided arguments when called
  MyMath.randomChoice = function randomChoice(choices) {
    if (arguments.length === 1 && Array.isArray(choices)) {
      return choices[(Math.random() * choices.length) | 0];
    }
    return arguments[(Math.random() * arguments.length) | 0];
  };

  // Clamps a number between min and max values
  MyMath.clamp = function clamp(num,min,max) {
    return Math.min(Math.max(num,min),max);
  };


  return MyMath;

})(Math);

const soundManager = {
  baseURL: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/329180/',
  ctx: new (window.AudioContext || window.webkitAudioContext),
  sources: {
    lift: {
      volume: 1,
      playbackRateMin: 0.85,
      playbackRateMax: 0.95,
      fileNames: [
        'lift1.mp3',
        'lift2.mp3',
        'lift3.mp3'
      ]
    },
    burst: {
      volume: 1,
      playbackRateMin: 0.8,
      playbackRateMax: 0.9,
      fileNames: [
        'burst1.mp3',
        'burst2.mp3'
      ]
    },
    burstSmall: {
      volume: 0.25,
      playbackRateMin: 0.8,
      playbackRateMax: 1,
      fileNames: [
        'burst-sm-1.mp3',
        'burst-sm-2.mp3'
      ]
    },
    crackle: {
      volume: 0.2,
      playbackRateMin: 1,
      playbackRateMax: 1,
      fileNames: ['crackle1.mp3']
    },
    crackleSmall: {
      volume: 0.3,
      playbackRateMin: 1,
      playbackRateMax: 1,
      fileNames: ['crackle-sm-1.mp3']
    }
  },

  preload() {
    const { sources,baseURL,ctx } = this
    const allFilePromises = [];
    const types = Object.keys(sources)
    return new Promise(res => {
      types.forEach((type,i) => {
        const source = sources[type]
        const { fileNames } = source
        const filePromises = []
        fileNames.forEach(fileName => {
          const p = fetch(baseURL + fileName)
            .then(v => v.arrayBuffer())
            .then(buffer => new Promise(res => {
              ctx.decodeAudioData(buffer,res,console.log)
            }))
          allFilePromises.push(p)
          filePromises.push(p)
        })
        Promise.all(filePromises).
          then(buffers => source.buffers = buffers)
          .finally(() => i + 1 === types.length && res())
      })
    })

    // Promise.all(allFilePromises).then(console.log)

  },
  /**
   * @param {'lift'|'burst'|'burstSmall'|'crackle'|'crackleSmall'} type 
   */
  playSound(type) {
    const source = this.sources[type]
    const sourceNode = this.ctx.createBufferSource()
    const gainNode = this.ctx.createGain()
    sourceNode.buffer = source.buffers[1]
    gainNode.gain.value = 1
    sourceNode.connect(gainNode).connect(this.ctx.destination)
    sourceNode.start(0)
  }
}
soundManager.preload().then(() => {
  document.onclick = () => soundManager.playSound('burst')
})


