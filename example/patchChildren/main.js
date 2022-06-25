import { createApp } from "../../lib/guide-mini-vue.esm.js";
import { App } from "./app.js";
const rootCommponent = document.querySelector("#app");

createApp(App).mount(rootCommponent);

function Player(name, teamColor) {
  this.partners = []; // 队友列表
  this.enemise = []; // 敌人列表
  this.state = "live"; // 玩家状态
  this.name = name; // 角色名字
  this.teamColor = teamColor;
}

Player.prototype.win = function () {
  console.log("winner" + this.name);
};
Player.prototype.lose = function () {
  console.log("loseer" + this.name);
};

Player.prototype.die = function () {
  var all_dead = true;
  this.state = "dead";
  debugger;
  for (var i = 0, partners; (partners = this.partners[i++]); ) {
    if (partners.state !== "dead") {
      all_dead = false;
      break;
    }
  }

  if (all_dead === true) {
    this.lose();
    for (var i = 0, partners; (partners = this.partners[i++]); ) {
      partners.lose();
    }
    for (var i = 0, enemise; (enemise = this.enemise[i++]); ) {
      enemise.win();
    }
  }
};
var players = [];
var playerFactory = function (name, teamColor) {
  var newPlayer = new Player(name, teamColor);
  for (var i = 0, player; (player = players[i++]); ) {
    if (player.teamColor == newPlayer.teamColor) {
      player.partners.push(newPlayer); // 互相添加队友
      newPlayer.partners.push(player);
    } else {
      player.enemise.push(newPlayer); // 互相添加敌人
      newPlayer.enemise.push(player);
    }
  }
  players.push(newPlayer);
  return newPlayer;
};

var player1 = playerFactory("皮蛋", "red");
var player2 = playerFactory("小明", "red");
var player3 = playerFactory("小红", "red");
var player4 = playerFactory("小强", "red");
var player5 = playerFactory("黑妞", "blue");
var player6 = playerFactory("蒜头", "blue");
var player7 = playerFactory("胖对", "blue");
var player8 = playerFactory("傻子", "blue");

player1.die();
player2.die();
player3.die();
player4.die();
