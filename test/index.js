var should = require('should'),
	play = require("../lib/google-play-scraper"),
	c = require('../lib/constants');

describe('play.app', function() {
	var appId = 'com.square_enix.android_googleplay.FFT_en2';
	
	it('should return a resolved Promise', function(done) {
    	var app = play.app(appId);

        app.isResolved().should.be.true;
        done();
	});

});

describe('play.developer', function() {

	it('should return a resolved Promise', function(done) {		
    	var apps = play.developer('SQUARE ENIX Co.,Ltd.');
    		
        apps.isResolved().should.be.true;
        done();
	});

});

describe('play.list', function() {
	
	it('should return a resolved Promise', function(done) {
    	var apps = play.list({
	    		category: c.category.GAME_SIMULATION
	    	});

        apps.isResolved().should.be.true;    
        done();    
	});

});

describe('play.search', function() {
	
	it('should return a resolved Promise', function(done) {
    	var apps = play.search({
    			term: 'tatics',
    			num: 1
    		});	    	

	    apps.isResolved().should.be.true;	
	    done();
	});

});

describe('play.suggest', function() {
	
	it('should return a resolved Promise', function(done) {
    	var suggests = play.suggest('tatics');

        suggests.isResolved().should.be.true;
        done();
	});

});
