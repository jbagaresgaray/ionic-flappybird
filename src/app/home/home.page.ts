import { Platform } from "@ionic/angular";
import {
  Component,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  OnInit
} from "@angular/core";

import { Media, MediaObject } from "@ionic-native/media/ngx";

declare const Phaser: any;

@Component({
  selector: "app-home",
  encapsulation: ViewEncapsulation.None,
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
})
export class HomePage implements OnInit {
  mainState: any = {};
  labelScore: any = {};

  appHeight: number;
  appWidth: number;

  bird: any;
  bg: any;
  fg: any;
  pipeNorth: any;
  pipeSouth: any;

  gap: number;
  constant: any;

  bX: number;
  bY: number;
  gravity: number;
  score: number;

  pipe: any[] = [];

  flyAudio: MediaObject;
  scoreAudio: MediaObject;

  @ViewChild("gameDiv") gameDiv: ElementRef;
  constructor(public platform: Platform, private media: Media) {
    //
  }

  ngOnInit() {
    this.appHeight = this.platform.height();
    this.appWidth = this.platform.width();

    console.log("height: ", this.appHeight);
    console.log("width: ", this.appWidth);

    // const cvs: any = document.getElementById("gameDiv");
    // const ctx: any = cvs.getContext("2d");

    let pipes = null;
    let timer = null;
    let jumpSound = null;

    const config = {
      type: Phaser.AUTO,
      parent: this.gameDiv.nativeElement,
      scene: {
        preload: preload,
        create: create,
        update: update
      },
      width: this.appWidth,
      height: this.appHeight
    };
    const game = new Phaser.Game(config);

    function preload() {
      console.log("preload: ", game);
      // game.stage.backgroundColor = '#71c5cf';

      this.load.image("bird", "assets/bird.png");
      this.load.image("pipe", "assets/pipe.png");

      // Load the jump sound
      this.load.audio("jump", "assets/jump.wav");

      this.load.image("jumpbutton", "assets/jump.png");
    }

    function create() {
      console.log("create: ", game);
      game.physics.startSystem(Phaser.Physics.ARCADE);

      this.pipes = game.add.group();
      this.pipes.enableBody = true;
      this.pipes.createMultiple(20, "pipe");
      this.timer = this.game.time.events.loop(1500, this.addRowOfPipes, this);

      this.bird = this.game.add.sprite(100, 245, "bird");
      game.physics.arcade.enable(this.bird);
      this.bird.body.gravity.y = 1000;

      // New anchor position
      this.bird.anchor.setTo(-0.2, 0.5);

      const jumpbutton = game.add.button(
        game.world.centerX - 40,
        420,
        "jumpbutton",
        this.jump,
        this,
        2,
        1,
        0
      );

      this.score = 0;
      this.labelScore = this.game.add.text(20, 20, "0", {
        font: "30px Arial",
        fill: "#ffffff"
      });

      // Add the jump sound
      this.jumpSound = this.game.add.audio("jump");
    }

    function update() {
      console.log("update: ", game);
      if (this.bird.inWorld === false) {
        this.restartGame();
      }

      game.physics.arcade.overlap(
        this.bird,
        this.pipes,
        this.hitPipe,
        null,
        this
      );

      // Slowly rotate the bird downward, up to a certain point.
      if (this.bird.angle < 20) {
        this.bird.angle += 1;
      }
    }

    const jump = () => {
      // If the bird is dead, he can't jump
      if (this.bird.alive === false) {
        return;
      }

      this.bird.body.velocity.y = -350;

      // Jump animation
      game.add
        .tween(this.bird)
        .to({ angle: -20 }, 100)
        .start();

      // Play sound
      jumpSound.play();
    };

    function addOnePipe(x, y) {
      const pipe = pipes.getFirstDead();

      pipe.reset(x, y);
      pipe.body.velocity.x = -200;
      pipe.checkWorldBounds = true;
      pipe.outOfBoundsKill = true;
    }

    function addRowOfPipes() {
      const hole = Math.floor(Math.random() * 5) + 1;

      for (let i = 0; i < 8; i++) {
        if (i !== hole && i !== hole + 1) {
          addOnePipe(400, i * 60 + 10);
        }
      }

      this.score += 1;
      this.labelScore.text = this.score;
    }

    function restartGame() {
      game.state.start("main");
    }

    function hitPipe() {
      // If the bird has already hit a pipe, we have nothing to do
      if (this.bird.alive === false) {
        return;
      }

      // Set the alive property of the bird to false
      this.bird.alive = false;

      // Prevent new pipes from appearing
      game.time.events.remove(timer);

      // Go through all the pipes, and stop their movement
      pipes.forEachAlive(p => {
        p.body.velocity.x = 0;
      }, this);
    }

    console.log("game: ", game);

    // this.bird = new Image();
    // this.bg = new Image();
    // this.fg = new Image();
    // this.pipeNorth = new Image();
    // this.pipeSouth = new Image();

    // this.gap = 85;
    // this.bX = 10;
    // this.bY = 150;
    // this.gravity = 1.5;

    // this.score = 0;

    // this.pipe[0] = {
    //   x: cvs.width,
    //   y: 0
    // };

    // this.flyAudio = this.media.create("./assets/sounds/fly.mp3");
    // this.scoreAudio = this.media.create("./assets/sounds/score.mp3");

    // this.bird.src = "./assets/bird.png";
    // this.bg.src = "./assets/bg.png";
    // this.fg.src = "./assets/fg.png";
    // this.pipeNorth.src = "./assets/pipeNorth.png";
    // this.pipeSouth.src = "./assets/pipeSouth.png";

    // this.bg.onload = () => {
    //   vm.bg.width = vm.appWidth;
    //   vm.bg.height = vm.appHeight;
    // };

    // const moveUp = () => {
    //   this.bY -= 25;
    //   if (this.platform.is("cordova")) {
    //     this.flyAudio.play();
    //   }
    // };

    // const draw = () => {
    //   ctx.drawImage(this.bg, 0, 0);

    //   // tslint:disable-next-line:prefer-for-of
    //   for (let i = 0; i < this.pipe.length; i++) {
    //     this.constant = this.pipeNorth.height + this.gap;
    //     ctx.drawImage(this.pipeNorth, this.pipe[i].x, this.pipe[i].y);
    //     ctx.drawImage(
    //       this.pipeSouth,
    //       this.pipe[i].x,
    //       this.pipe[i].y + this.constant
    //     );

    //     this.pipe[i].x--;

    //     if (this.pipe[i].x === 125) {
    //       this.pipe.push({
    //         x: cvs.width,
    //         y:
    //           Math.floor(Math.random() * this.pipeNorth.height) -
    //           this.pipeNorth.height
    //       });
    //     }

    //     // detect collision

    //     // if (
    //     //   (this.bX + this.bird.width >= this.pipe[i].x &&
    //     //     this.bX <= this.pipe[i].x + this.pipeNorth.width &&
    //     //     (this.bY <= this.pipe[i].y + this.pipeNorth.height ||
    //     //       this.bY + this.bird.height >= this.pipe[i].y + this.constant)) ||
    //     //   this.bY + this.bird.height >= cvs.height - this.fg.height
    //     // ) {
    //     //   console.log("reload the page: ");
    //     //   // location.reload(); // reload the page
    //     // }

    //     if (this.pipe[i].x === 5) {
    //       this.score++;

    //       if (this.platform.is("cordova")) {
    //         this.scoreAudio.play();
    //       }
    //     }
    //   }

    //   ctx.drawImage(this.fg, 0, cvs.height - this.fg.height);
    //   ctx.drawImage(this.bird, this.bX, this.bY);

    //   this.bY += this.gravity;

    //   ctx.fillStyle = "#000";
    //   ctx.font = "20px Verdana";
    //   ctx.fillText("Score : " + this.score, 10, cvs.height - 20);

    //   requestAnimationFrame(draw);
    // };

    // document.addEventListener("mousedown", moveUp);
    // draw();
  }
}
