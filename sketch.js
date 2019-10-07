var nodes = [];
var connections = [];
var letters = [];
var pixel = 30;
var mdel = -5;
var next = {
  x: 2,
  y: 2,
  colour: "white"
}

var wrap;

function Node(i, j) {
  this.x = i;
  this.y = j;
  this.min = 2;
  this.max = 50;
  this.r = 0;
  this.grow = 0;
  this.reverse = 1;
  this.s = 1;
  this.d = 0.1;
  this.colour = 0;
}

function Connection(i, j, ii, jj, c = 0) {
  this.a = nodes[i][j];
  this.b = nodes[ii][jj];
  this.ij = [i, j, ii, jj];
  this.a.colour = c;
  this.b.colour = c;
  this.control = 0;
  this.reach = 0;
  this.thick = 0;
  this.s = 0.025;
  this.t = 50;
  this.f = this.t;
  this.m = (jj - j) / (ii - i);
  this.p = -1 / this.m;
  this.check = [0.9, 0.8, 0.6];
  this.reverse = 0;
  this.colour = c;
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  for (var i = 0; i <= width; i += pixel) {
    var row = [];
    for (var j = 0; j <= height; j += pixel) {
      row.push(new Node(i, j));
    }
    nodes.push(row);
  }

  warp = width / pixel - 2;

  // connections.push(
  //   new Connection(2, 1, 3, 5),
  //   new Connection(2, 1, 1, 5),
  //   new Connection(1, 5, 2, 5),
  //   new Connection(2, 3, 2, 5)
  // );
}

var f = 0;
function draw() {
  f++;
  background(255);
  stroke(0);
  fill(0);
  strokeWeight(0);
  keys();
  pause = true;
  for (var i = 0; i < connections.length; i++) {
    push();
    var c = connections[i];
    var pa = c.a;
    var pb = c.b;
    var control;
    var reach;
    var offset;

    fill(c.colour);

    // print(pb.r);

    if (c.f > c.t) {
      c.control = 0;
      c.reach = 0;
      c.thick = 0;
      c.s = 0.025;
      c.t = 50;
      c.f = c.t;
      c.reverse = 0;
      pa.r = 0;
      pb.r = 0;
    } else if ((c.f > 0 && c.reverse == 1) || (c.f <= c.t && c.reverse == mdel)) {
      if (c.f > c.t * c.check[0]) {
        pa.grow = 0.25 / (1 - c.check[0]);
        pb.grow = 0.25 / (1 - c.check[0]);
      } else if (c.f > c.t * c.check[1]) {
        c.reach += 0.5 / c.t / (c.check[0] - c.check[1]) * c.reverse;
        pa.grow = -0.75 / c.check[0];
        pb.grow = -0.75 / c.check[0];
      } else if (c.f > c.t * c.check[2]) {
        c.control += 0.25 / c.t / (c.check[1] - c.check[2]) * c.reverse;
        pa.grow = -0.75 / c.check[0];
        pb.grow = -0.75 / c.check[0];
      } else {
        c.thick += 2 / c.t / c.check[2] * c.reverse;
        pa.grow = -0.75 / c.check[0];
        pb.grow = -0.75 / c.check[0];
      }
      if (c.reverse == mdel) {
        c.f -= mdel;
        pa.reverse = mdel;
        pb.reverse = mdel;
      } else {
        c.f--;
        pa.reverse = 1;
        pb.reverse = 1;
      }
    }

    // print(c.p, c.m);
    var sign = abs(c.p) / c.p;
    sign = isNaN(sign) ? 1 : sign;
    offset = {
      x: sign * sqrt(1 / (c.p ** 2 + 1)),
      y: sqrt(1 / (c.m ** 2 + 1)),
    }

    // print(offset)

    if (c.f <= c.t * c.check[2]) {

      // strokeWeight(1);
      beginShape();
      vertex(pa.x + pa.r * offset.x, pa.y + pa.r * offset.y);
      quadraticVertex((pa.x + pb.x) / 2 - (pb.r + pa.r) / 2 * (1 - c.thick) * offset.x, (pa.y + pb.y) / 2 - (pb.r + pa.r) / 2 * (1 - c.thick) * offset.y, pb.x + pb.r * offset.x, pb.y + pb.r * offset.y);
      vertex(pb.x - pb.r * offset.x, pb.y - pb.r * offset.y);
      quadraticVertex((pa.x + pb.x) / 2 + (pb.r + pa.r) / 2 * (1 - c.thick) * offset.x, (pa.y + pb.y) / 2 + (pb.r + pa.r) / 2 * (1 - c.thick) * offset.y, pa.x - pa.r * offset.x, pa.y - pa.r * offset.y);
      endShape(CLOSE);

    } else {
      // strokeWeight(1);
      var n = [pb, pa];

      for (var j = 0; j < 2; j++) {
        // ellipse(n[j].x + n[j].r * offset.x, n[j].y + n[j].r * offset.y, 10);
        beginShape();
        control = {
          x: n[j].x + (n[(j + 1) % 2].x - n[j].x) * c.control,
          y: n[j].y + (n[(j + 1) % 2].y - n[j].y) * c.control
        }
        reach = {
          x: n[j].x + (n[(j + 1) % 2].x - n[j].x) * c.reach,
          y: n[j].y + (n[(j + 1) % 2].y - n[j].y) * c.reach
        }
        vertex(n[j].x + n[j].r * offset.x, n[j].y + n[j].r * offset.y);
        quadraticVertex(control.x, control.y, reach.x, reach.y);
        quadraticVertex(control.x, control.y, n[j].x - n[j].r * offset.x, n[j].y - n[j].r * offset.y);
        endShape(CLOSE);
      }
    }

    pop();
  }

  for (var i = 0; i < nodes.length; i++) {
    var row = nodes[i];
    for (var j = 0; j < row.length; j++) {
      var node = row[j];
      if (node.grow) {
        node.r += node.grow > 0 ? node.s * node.grow * node.reverse : node.d * node.grow * node.reverse;
        node.grow = 0;
      }

      push();
      fill(node.colour);
      ellipse(node.x, node.y, node.r * 2);
      pop();
    }
  }
  

  connections = connections.filter(x => x.reverse);
  letters = letters.filter(x => !x.erase);
  
  push();
  strokeWeight(3);
  stroke(next.colour);
  line(nodes[next.x][next.y].x-pixel/2, nodes[next.x][next.y].y, nodes[next.x][next.y].x-pixel/2, nodes[next.x][next.y].y+pixel*4)
  pop();
  
  if (f%15==0) {
    if (next.colour == "white") {
      next.colour = random(["purple", "blue", "magenta", "hotpink", "indigo", "navy"]);
    } else {
      next.colour = "white";
    }
  }
}

function Letter(lines, c = 0, t = true) {
  this.strokes = lines;
  this.connections = [];
  this.erase = false;
  this.next = {
    x: next.x,
    y: next.y
  };

  for (var i = 0; i < lines.length; i++) {
    this.connections.push(new Connection(lines[i][0] + next.x, lines[i][1] + next.y, lines[i][2] + next.x, lines[i][3] + next.y, c));
  }


  connections = connections.concat(this.connections);

  this.type = function() {
    next.x += c == null ? 2 : max(this.strokes.map(x => x[0]).concat(this.strokes.map(x => x[2]))) + 1;
    if (next.x >= warp - 2 || c == "return") {
      // if (nodes[0][next.y].y > height - pixel * 6) {
      //   return;
      // }
      next.y += 6;
      next.x = 2;
    }
    for (var i = 0; i < this.connections.length; i++) {
      this.connections[i].reverse = 1;
    }
  }

  this.del = function() {
    next.x = this.next.x;
    next.y = this.next.y;
    for (var i = 0; i < this.connections.length; i++) {
      this.connections[i].reverse = mdel;
    }
    this.erase = true;
  }

  if (t) {
    this.type();
  }

  letters.push(this);
}


function keys() {
  if (keyIsDown(68)) {
    connections[0].reach -= 0.01
  }
  if (keyIsDown(83)) {
    connections[0].reach += 0.01
    connections[0].control += 0.005
  }
  if (keyIsDown(87)) {
    connections[0].reach -= 0.01
    connections[0].control -= 0.005
  }
}

function keyTyped() {
  
  if (next.y + 6 < height / pixel) {
    if (keyCode == 13) {
      letters.push(new Letter([], "return", true));
      return;
    }
    if (key == " ") {
      letters.push(new Letter([], null, true));
      return;
    }
    var colour = random(["purple", "blue", "magenta", "hotpink", "indigo", "navy"]);
    // print(key);
    // print(colour);
    
    if (alphabet[key]) {
      letters.push(new Letter(alphabet[key], colour, true));
    } else {
      print(key);
    }
  }
}


function keyPressed() {
  if ((keyCode == BACKSPACE || keyCode == DELETE) && letters.length) {
    letters[letters.length - 1].del();
  }
  // if (key == 13) {
  //   letters.push(new Letter([], "return", true));
  //   return;
  // }
}


