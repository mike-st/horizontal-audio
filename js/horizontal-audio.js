

define([
	'coreJS/adapt'
], function(Adapt) {

	var horizontalaudioView = Backbone.View.extend({

		_blockModels: null,
		_blockModelsIndexed: null,
		_onBlockInview: null,
		$backgroundContainer: null,
		$backgrounds: null,
		$blockElements: null,
		_firstId: null,
		_activeId: null,

		initialize: function() {
			this._blockModels = this.model.findDescendants('blocks').filter(function(model) {
				return model.get("_horizontal-audio");
			});
			if(this._blockModels.length == 0) {
			        this.onRemove();
			        return;
			}
			this._blockModelsIndexed = _.indexBy(this._blockModels, "_id");

			this.listenTo(Adapt, "pageView:ready", this.onPageReady);
			this.listenTo(Adapt, "remove", this.onRemove);
			this.setupBackgroundContainer();
		},

		onPageReady: function() {

			this.$blockElements = {};
			this.$backgrounds = {};
			this.callbacks = {};         

			for (var i = 0, l = this._blockModels.length; i < l; i++) {
				var blockModel = this._blockModels[i];				
				if(!blockModel.get('_horizontal-audio')) continue;

				var id = blockModel.get("_id");

				if (!this._firstId) this._firstId = id;

				var $blockElement = this.$el.find("."+ id);

				$blockElement.attr("data-horizontal-audio", id);
				this.$blockElements[id] = $blockElement;

				var options = blockModel.get('_horizontal-audio');
	            
	            this.callbacks[id] = _.bind(this.onBlockInview, this);

	            this.$blockElements[id].on("onscreen", this.callbacks[id]);

	            if (options.src == ""){	
	            	var $backGround = $('<script> var x'+id+' = document.getElementById("myAudio'+id+'"); $("#myAudio'+id+'").on("ended", function() { $(".' + id +'.audiopauseicon").removeAttr("onclick"); $(".' + id +'.audiopauseicon").attr("onclick","playAudio'+id+'()").removeClass("audiopauseicon").addClass("audioplayicon"); }); function playAudio'+id+'() { x'+id+'.play(); $(".' + id +'.audioplayicon").removeAttr("onclick"); $(".' + id +'.audioplayicon").attr("onclick","pauseAudio'+id+'()").removeClass("audioplayicon").addClass("audiopauseicon"); } function pauseAudio'+id+'() { x'+id+'.pause(); $(".' + id +'.audiopauseicon").removeAttr("onclick"); $(".' + id +'.audiopauseicon").attr("onclick","playAudio'+id+'()").removeClass("audiopauseicon").addClass("audioplayicon"); } </script><audio id="myAudio'+id+'"><source src="adapt/css/fonts/blank.mp3" type="audio/mpeg" style=""> </audio><button onclick="playAudio'+id+'()" type="button" class="disabled audioplayicon ' + id +'" disabled="disabled"></button>');
				}else{
					var $backGround = $('<script> var x'+id+' = document.getElementById("myAudio'+id+'"); $("#myAudio'+id+'").on("ended", function() { $(".' + id +'.audiopauseicon").removeAttr("onclick"); $(".' + id +'.audiopauseicon").attr("onclick","playAudio'+id+'()").removeClass("audiopauseicon").addClass("audioplayicon"); }); function playAudio'+id+'() { x'+id+'.play(); $(".' + id +'.audioplayicon").removeAttr("onclick"); $(".' + id +'.audioplayicon").attr("onclick","pauseAudio'+id+'()").removeClass("audioplayicon").addClass("audiopauseicon"); } function pauseAudio'+id+'() { x'+id+'.pause(); $(".' + id +'.audiopauseicon").removeAttr("onclick"); $(".' + id +'.audiopauseicon").attr("onclick","playAudio'+id+'()").removeClass("audiopauseicon").addClass("audioplayicon"); } </script><audio id="myAudio'+id+'"><source src="' + options.src + '" type="audio/mpeg" style=""> </audio><button onclick="playAudio'+id+'()" type="button" class="audioplayicon ' + id +'"></button>');
				}
				//this.$backgroundContainer.prepend($backGround);
				$blockElement.find('.block-inner').prepend($backGround);
				this.$backgrounds[id] = $backGround;

				$(".block.nth-child-1 .audioplayicon").addClass("activeaudio").attr("onclick","pauseAudio"+id+"()").removeClass("audioplayicon").addClass("audiopauseicon");
				$(".block.nth-child-1 .block-inner audio").attr("autoplay","autoplay");

			}

			this._activeId = this._firstId;


		},

		setupBackgroundContainer : function() {

                this.$backgroundContainer = $('<div class="horz-audio-container"></div>');
				this.$el.addClass('horz-audio-active');
				this.$el.prepend(this.$backgroundContainer);

				var count = 1;
				var pluscount = count+1;
				var minuscount = count-1;
	            $('[data-block-slider="right"]') .click(function(){
	            	count++;
	            	$('.block .audioplayicon').removeClass('activeaudio');
	                $('.block.nth-child-' + count + ' .audioplayicon').addClass('activeaudio');
	                $( '.activeaudio' ).trigger( 'click' );
	            });
	            $('[data-block-slider="left"]') .click(function(){
	            	count -=1;
	            	$('.block .audioplayicon').removeClass('activeaudio');
	                $('.block.nth-child-' + count + ' .audioplayicon').addClass('activeaudio');
	                $( '.activeaudio' ).trigger( 'click' );
	            });
	            /* $('[data-page-level-progress-id="'+id+'"]') .click(function(){
	            	alert('menu clicked');
	            });*/

		},
		

		onBlockInview: function(event, measurements) {
			var isOnscreen = measurements.percentFromTop < 80 && measurements.percentFromBottom < 80 ;
			if (!isOnscreen) return;

			var $target = $(event.target);
			var id = $target.attr("data-horizontal-audio");

			if (this._activeId === id) return;

			this._activeId = id;


		},

		onRemove: function () {
			for (var id in this.$blockElements) {
				this.$blockElements[id].off("onscreen", this.callbacks[id]);
			}
			this.$blockElements = null;
			this.$backgrounds = null;
			this._onBlockInview = null;
		}


	});

	Adapt.on("pageView:postRender", function(view) {
		var model = view.model;
		if (model.get("_horizontal-audio")) {
			if (model.get("_horizontal-audio")._isActive) {
				new horizontalaudioView({model: model, el: view.el });
			}
		}
	});

});	
