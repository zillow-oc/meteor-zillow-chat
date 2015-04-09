/**
 * Meteor Braindump Example @ Zillow
 * 
 * Chat Application Example
 * 
 * Author: Andreas Schwarz <andys@zillow.com>
 *
 */

/**
 * Globals
 */

// Room
currentRoom = new ReactiveVar();
currentRoom.set(Settings.rooms[0].name);


// User
currentUser = new ReactiveVar();

currentUser.set((function() {

	try {
		return JSON.parse(localStorage['user']);

	} catch(e) {
	}
	return false;

}).call() || (function() {

	var user = {
		id: Meteor.uuid(),
		name: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
		color: '#' + ['43CD80', 'FFF68F', '00E5EE', 'B9D3EE', '1E90FF', 'FF4040', 'EE9A00', 'EE1289', 'EE00EE', '68228B'][Math.floor(Math.random() * 10)]
	};

	localStorage['user'] = JSON.stringify(user);

	return user;

}).call());


/**
 * Generic Template Helpers
 */
 
UI.registerHelper("navigationLink", function(label) {
	return label.replace(/\W+/g, "").toLowerCase();
});


UI.registerHelper("getUser", function() {

	return currentUser.get();

});


/**
 * (Template) Navigation 
 */
 
Template.navigation.helpers({

	getRooms: function() {

		return _.map(Settings.rooms, function(o, i) {
			return o.name;
		});

	},

	isSelected: function(name) {

		return currentRoom.get() == name ? "selected" : "";

	},

});

Template.navigation.events({

	'click #menu': function() {
		$('#navigation').sidebar('setting', {
			dimPage: false,
			closable: false,
		}).sidebar('toggle');

		$("#content").toggleClass("closed");
	},


	'click a': function(event, template) {

		currentRoom.set(this.toString());

		toBottom();
	}

});


/**
 * (Template) Content
 */


var toBottom = function() {
	$('#messages').stop().animate({
  		scrollTop: $("#messages")[0].scrollHeight
	}, 300);
};


Template.content.rendered = function() {
	toBottom();
};

 
Template.content.helpers({

	contentSections: function() {

		return Settings.sections;
		
	},

	isTemplate: function() {

		return Template[this.template];
	},

	isLocalUser: function() {

		return this.user.id == currentUser.get().id ? "localUser" : "";
	},

	getMessages: function() {

		return Messages.find({
			room: currentRoom.get()
		});
	},

	getTimestampLabel: function() {

		var date = this.date;

		return (date.getMonth()+1) + '/' + date.getDate() + '/' +  date.getFullYear() + ' at ' + date.getHours() + ':' + date.getMinutes();

	},

	getMessage: function() {

		var emoticons = {
		    ':)'  : 'smile',
			':-)' : 'smile',
		    ':D'  : 'laughing',
		    ':('  : 'angry',
		    ':]'  : 'robot',
		    '8)'  : 'sunglass',
			':o'  : 'surprise',
			';)'  : 'wink',
			':P'  : 'tongue',
			':{'  : 'mustache',
			':z'  : 'zillow',
		}, p = [], m = /[[\]{}()*+?.\\|^$\-,&#\s]/g;

		for(var i in emoticons) {
			if(emoticons.hasOwnProperty(i)) {
				p.push('(' + i.replace(m, "\\$&") + ')');
			}
		}

		return Handlebars._escape(this.message).replace(new RegExp(p.join("|"), "g"), function (match) {
			
			return typeof emoticons[match] != 'undefined' ? '<img emotion src="/emotions/'+emoticons[match]+'.svg"/>' : match;

		});
	},

});

Template.content.events({

	'keydown #input': function(event, template) {

		if(event.which == 13) {

			var message = $("#messageInput").val() || '';

			if(message.length > 0) {

				Messages.insert({

					user: currentUser.get(),

					message: message,

					date: new Date(),

					room: currentRoom.get(),

				});

				$("#messageInput").val("").focus();

				toBottom();
			}
		}
	},

	'resize': toBottom,

});


Template.avatar.helpers({

	getName: function() {
		return this.name.substr(0, 1);
	}
});