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

  constructor(public platform: Platform, private media: Media) {
    // this.game = new Phaser.Game(400, 490, Phaser.AUTO, "gameDiv");
    this.appHeight = this.platform.height();
    this.appWidth = this.platform.width();

    console.log("height: ", this.appHeight);
    console.log("width: ", this.appWidth);
  }

  ngOnInit() {
    const cvs: any = document.getElementById("canvas");
    const ctx: any = cvs.getContext("2d");
    const vm = this;

    this.bird = new Image();
    this.bg = new Image();
    this.fg = new Image();
    this.pipeNorth = new Image();
    this.pipeSouth = new Image();

    this.gap = 85;
    this.bX = 10;
    this.bY = 150;
    this.gravity = 1.5;

    this.score = 0;

    this.pipe[0] = {
      x: cvs.width,
      y: 0
    };

    this.flyAudio = this.media.create("./assets/sounds/fly.mp3");
    this.scoreAudio = this.media.create("./assets/sounds/score.mp3");

    this.bird.src = "./assets/bird.png";
    this.bg.src = "./assets/bg.png";
    this.fg.src = "./assets/fg.png";
    this.pipeNorth.src = "./assets/pipeNorth.png";
    this.pipeSouth.src = "./assets/pipeSouth.png";

    this.bg.onload = () => {
      vm.bg.width = vm.appWidth;
      vm.bg.height = vm.appHeight;
    };

    const moveUp = () => {
      this.bY -= 25;
      if (this.platform.is("cordova")) {
        this.flyAudio.play();
      }
    };

    const draw = () => {
      ctx.drawImage(this.bg, 0, 0);

      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.pipe.length; i++) {
        this.constant = this.pipeNorth.height + this.gap;
        ctx.drawImage(this.pipeNorth, this.pipe[i].x, this.pipe[i].y);
        ctx.drawImage(
          this.pipeSouth,
          this.pipe[i].x,
          this.pipe[i].y + this.constant
        );

        this.pipe[i].x--;

        if (this.pipe[i].x === 125) {
          this.pipe.push({
            x: cvs.width,
            y:
              Math.floor(Math.random() * this.pipeNorth.height) -
              this.pipeNorth.height
          });
        }

        // detect collision

        if (
          (this.bX + this.bird.width >= this.pipe[i].x &&
            this.bX <= this.pipe[i].x + this.pipeNorth.width &&
            (this.bY <= this.pipe[i].y + this.pipeNorth.height ||
              this.bY + this.bird.height >= this.pipe[i].y + this.constant)) ||
          this.bY + this.bird.height >= cvs.height - this.fg.height
        ) {
          console.log("reload the page: ");
          // location.reload(); // reload the page
        }

        if (this.pipe[i].x === 5) {
          this.score++;

          if (this.platform.is("cordova")) {
            this.scoreAudio.play();
          }
        }
      }

      ctx.drawImage(this.fg, 0, cvs.height - this.fg.height);
      ctx.drawImage(this.bird, this.bX, this.bY);

      this.bY += this.gravity;

      ctx.fillStyle = "#000";
      ctx.font = "20px Verdana";
      ctx.fillText("Score : " + this.score, 10, cvs.height - 20);

      requestAnimationFrame(draw);
    };

    document.addEventListener("keydown", moveUp);
    draw();
  }
}
