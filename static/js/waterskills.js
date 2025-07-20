function runSkillCanvas() {
    new p5(function (p) {
      const skills = [
        { name: "Python", units: 15, color: "#ecfdf5" },
        { name: "JavaScript", units: 8, color: "#ecfdf5" },
        { name: "Git", units: 8, color: "#d0fae5" },
        { name: "Integrating AI", units: 10, color: "#d0fae5" },
        { name: "Webscraping", units: 8, color: "#a4f4cf" },
        { name: "C++", units: 6, color: "#a4f4cf" },
        { name: "SQL", units: 6, color: "#5ee9b5" },
        { name: "Typescript", units: 4, color: "#5ee9b5" },
        { name: "Tailwind", units: 6, color: "#00d492" },
        { name: "ML Pipelines", units: 8, color: "#00d492" },
        { name: "Docker", units: 3, color: "#00bc7d" },
        { name: "Cloud", units: 3, color: "#00bc7d" },
        { name: "HTML/CSS", units: 8, color: "#00bc7d" },
      ];
  
      let blobs = [];
  
      p.setup = function () {
        const container = document.getElementById("skills-canvas");
        if (!container) {
          return;
        }
  
        const c = p.createCanvas(container.offsetWidth, container.offsetHeight);
        c.parent(container);
  
        for (let skill of skills) {
          blobs.push(new Blob(
            p.random(p.width), p.random(p.height),
            skill.units * 4 + 30,
            skill.name, skill.color
          ));
        }
      };
  
      p.draw = function () {
        p.background("#007a55");
        for (let blob of blobs) {
          blob.update();
          blob.display();
        }
      };
  
      p.windowResized = function () {
        const container = document.getElementById("skills-canvas");
        if (container) {
          p.resizeCanvas(container.offsetWidth, container.offsetHeight);
        }
      };
  
      class Blob {
        constructor(x, y, r, label, color) {
          this.pos = p.createVector(x, y);
          this.vel = p.createVector(p.random(-2, 2), p.random(-2, 2));
          this.r = r;
          this.label = label;
          this.color = color;
        }
  
        update() {
            if (this.pos.x - this.r < 0) {
                this.pos.x = this.r;
                this.vel.x *= -1;
                }
                if (this.pos.x + this.r > p.width) {
                this.pos.x = p.width - this.r;
                this.vel.x *= -1;
                }
                
                // Y bounds
                if (this.pos.y - this.r < 0) {
                this.pos.y = this.r;
                this.vel.y *= -1;
                }
                if (this.pos.y + this.r > p.height) {
                this.pos.y = p.height - this.r;
                this.vel.y *= -1;
                }
  
          let mouse = p.createVector(p.mouseX, p.mouseY);
          let dir = p5.Vector.sub(this.pos, mouse);
          let d = dir.mag();
          if (d < this.r + 100) {
            dir.setMag((this.r + 100 - d) * 0.05);
            this.vel.add(dir);
          }
  
          this.pos.add(this.vel);
          this.vel.mult(0.95);
        }
  
        display() {
          p.noStroke();
          p.fill(this.color + "33");
          p.ellipse(this.pos.x, this.pos.y, this.r * 2.5);
  
          p.fill(this.color);
          p.ellipse(this.pos.x, this.pos.y, this.r * 2);
  
          p.fill("#022c22");
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(this.r / 3.5);
          p.text(this.label, this.pos.x, this.pos.y);
        }
      }
    });
  }
  