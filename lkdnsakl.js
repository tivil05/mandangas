// ==UserScript==
// @name         Chrono.++
// @namespace    https://www.chrono.gg
// @version      1.0
// @description  Auto login, auto coin click, displays all available store-games on frontpage
// @author       Baizey
// @match        https://www.chrono.gg/
// @match        http://www.chrono.gg/
// @require https://code.jquery.com/jquery-3.1.1.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Your code here...
    var delay = function(func, ms = 500){
        setTimeout(function(){ func(); }, ms);
    };
    var coin = function(){
        if(needLogin() || ($(".dead") !== null && $(".dead").length > 0))
            delay(coin, 1000);
        else {
            $("#reward-coin").click();
            console.log("Clicked coin...");
        }
    };
    var loginStep3 = function(){
        if ( $(".modal-button") === null || $(".modal-button").length === 0 )
            console.log("Logged in...");
        else if( $(".modal__server-error") !== null && $(".modal__server-error").length > 0)
            console.log("An error happend... failed login");
        else
            delay(loginStep3);
    };
    var loginStep2 = function(){
        if( $(".cd-modal__button--login") === null )
            delay(loginStep2);
        else {
            $(".modal__button--login")[0].click();
            console.log("Clicking login...");
            delay(loginStep3);
        }
    };
    var loginStep1 = function(){
        if( $(".cd-signin") === null )
            delay(loginStep1);
        else {
            $(".cd-signin")[0].click();
            delay(loginStep2);
        }
    };
    var needLogin = function(){
        return $(".account-link") === null || $(".account-link").length === 0;
    };
    var activeGame = function(game){
        return game.active && !game.sold_out;
    };
    var gameViewHolder = function(){ return `<div id="gameViewContainer" class="ReactModal__Overlay ReactModal__Overlay--after-open modal__overlay"><div id="gameView" class="ReactModal__Content ReactModal__Content--after-open modal shopitem-modal" tabindex="-1" aria-label="Shop Game Modal" ><div class="shopitem-modal__wrapper" ><span class="modal-close"></span><div ><img src="/assets/images/shop/HASH/item-header.jpg"><hr ><div class="game-summary" ><div class="game-summary__header" ><span class="game-name">Slayaway Camp</span><span class="game-price" >PRICE</span></div><div class="os-steam" ><ul class="game-os" ><li class="game-os--windows" ></li><li class="game-os--linux" ></li><li class="game-os--osx" ></li></ul><span class="steam-game" >Steam Key(s)</span></div><p >SUMMARY</p><a href="URL" target="_blank" >View game on Steam</a><div class="game__claimed-progress" ><span class="claimed-value"><span>PERCENT%</span><span> Claimed</span></span><div class="progress-container" ><div class="progress-bar" style="width:PERCENT%;" ></div></div></div></div><div class="game__footer" ><button class="btn" ><div ><span >Pay</span><span                                class="button__game-price" >PRICE</span></div></button></div></div></div></div></div>`; };
    var availableGames = [];
    var viewGame = function(){
        var id = $(this).attr("id").split("_")[1] - 0;
        var game = availableGames[id];
        var html = gameViewHolder().replace(/HASH/g, game.hash).replace("NAME", game.name).replace(/PRICE/g, game.price).replace(/PERCENT/g, Math.round(game.claimed * 100)).replace("URL", game.url).replace("SUMMARY", game.description);
        html = $.parseHTML(html)[0];
        $(".ReactModalPortal")[0].append(html);
        $("body").attr("class", "ReactModal__Body--open");
        $("body").attr("aria-hidden", "true");
        $("#gameViewContainer").click(function() {
            $("#gameViewContainer").remove();
            $("body").attr("class", "");
            $("body").attr("aria-hidden", "false");
        });
        $('#gameView').click(function(event){
            event.stopPropagation();
        });
    };
    var gameholder = function(id){ return `<li id="availnum_`+id+`"><div class="item__headerBG" style="background-image:url('/assets/images/shop/HASH/item-header.jpg');"><video autoplay="" loop="" preload="none"poster="/assets/images/shop/HASH/item-header--alt.jpg"><source src="/assets/images/shop/HASH/item-header--alt.mp4" type="video/mp4"></video></div><hr ><div class="game-summary" ><span class="game-name">NAME</span><div class="game-summary__footer" ><ul class="game-os" ><li class="game-os--windows" ></li><span ></span><li class="game-os--linux" ></li><span ></span><li class="game-os--osx" ></li></ul><span class="game-price" >PRICE</span></div></div><div class="game__claimed-progress" ><span class="claimed-value"><span>PERCENT%</span><span> Claimed</span></span><div class="progress-container" ><div class="progress-bar" style="width:PERCENT%;" ></div></div></div></li>`;};
    var displayAvailableGames = function(){
        $.ajax({
            url: "https://api.chrono.gg/shop",
            complete: function(response){
                response = response.responseJSON;
                var container = $("<div/>");
                container.attr("class", "wrapper--content");
                var ul = $("<ul/>"); container.append(ul);
                ul.attr("class", "chrono-shop__games");
                var game;
                for(var i = 0; i < response.length; i++)
                    if(activeGame(response[i])){
                        game = response[i];
                        availableGames.push(game);
                        var html = gameholder(availableGames.length - 1).replace(/HASH/g, game.hash).replace("NAME", game.name).replace("PRICE", game.price).replace(/PERCENT/g, Math.round(game.claimed * 100));
                        html = $.parseHTML(html)[0];
                        ul.append(html);
                        html.addEventListener("click", viewGame, false);
                    }
                $("#pricing-info").after(container);
                $("#game-hero-bg").height("500px");
            }
        });
    };
    window.onload = function(){
        console.log("Chrono++ running...");
        // If not logged in, click necessary buttons
        if(needLogin()){ loginStep1(); }
        coin();
        displayAvailableGames();
        window.close();
    };
})();
