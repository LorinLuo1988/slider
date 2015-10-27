/**
 * Created by doyen on 2015/10/20.
 */
/*-------master*--------*/
(function ($) {
	function Slider (sliderContainer ,setting) {
		this.sliderContainer = sliderContainer;
		this.nextButton = sliderContainer.find("button.slider-next");
		this.prevButton = sliderContainer.find("button.slider-prev");
		this.slider = sliderContainer.find("ul.slider");
		this.sliderNav = sliderContainer.find("ul.slider-nav");
		this.setting = setting;
		this.timer = null;
		this.indicatorsType = setting.indicatorsType;

		this.intervalTime = this.setting.intervalTime;
		this.animateTime = this.setting.animateTime;
		this.frameTime = this.setting.frameTime;
		this.AnimateCount = this.animateTime / this.frameTime;
		this.slideDeltaX = Math.floor(this.sliderContainer.width() / this.AnimateCount);
		this.liIndex = 0;
		this.CarouselCount = this.slider.find("li").length;
		this.animateCounter = 0;
		this.sliding = false;
		this.pauseCommonSlide = false;

		this.initialize();
	};

	Slider.prototype.update = function (setting) {
		setting = setting || {};

		if (this.sliding) {
			this.updateDelay = function () {
				if (setting.intervalTime) {
					this.intervalTime = setting.intervalTime;
				}

				if (setting.animateTime) {
					this.animateTime = setting.animateTime;
				}

				if (setting.frameTime) {
					this.frameTime = setting.frameTime;
				}

				if (setting.indicatorsType == "round") {
					this.sliderNav.addClass("round");
				} else if (setting.indicatorsType == "rectangle") {
					this.sliderNav.removeClass("round");
				}

				this.AnimateCount = this.animateTime / this.frameTime;
				this.slideDeltaX = Math.floor(this.sliderContainer.width() / this.AnimateCount);
				delete this.updateDelay;
			}
			return false;
		}

		if (setting.intervalTime) {
			this.intervalTime = setting.intervalTime;
		}

		if (setting.animateTime) {
			this.animateTime = setting.animateTime;
		}

		if (setting.frameTime) {
			this.frameTime = setting.frameTime;
		}

		if (setting.indicatorsType == "round") {
			this.sliderNav.addClass("round");
		} else if (setting.indicatorsType == "rectangle") {
			this.sliderNav.removeClass("round");
		}

		this.AnimateCount = this.animateTime / this.frameTime;
		this.slideDeltaX = Math.floor(this.sliderContainer.width() / this.AnimateCount);
	};

	Slider.prototype.initialize = function () {
		this.setDefaultStyle().registerEvent().carouselRun();

		return this;
	};

	Slider.prototype.setDefaultStyle = function () {
		var sliderContainer = this.sliderContainer;
		var slider = this.slider;
		var sliderNav = this.sliderNav;
		var sliderLiCount = slider.find("li").length;

		slider.css({
			"width": sliderLiCount * 100 + "%"
		});

		slider.find("li").css({
			"width": 100 / sliderLiCount + "%"
		});

		sliderNav.find("li:first").addClass("active");

		if (this.indicatorsType == "round") {
			this.sliderNav.addClass("round");
		} else if (this.indicatorsType == "rectangle") {
			this.sliderNav.removeClass("round");
		}

		return this;
	};

	Slider.prototype.registerEvent = function () {
		var self = this;

		this.sliderContainer.on("mouseenter", function () {
			$(this).find("button.slider-prev").css("display", "block");
			$(this).find("button.slider-next").css("display", "block");

			if (self.timeout) {
				clearTimeout(self.timeout);
			}

			self.pauseCommonSlide = true;
		});

		this.sliderContainer.on("mouseleave", function () {
			$(this).find("button.slider-prev").css("display", "none");
			$(this).find("button.slider-next").css("display", "none");
			self.pauseCommonSlide = false;

			if (self.animateCounter == 0) {
				self.carouselRun();
			}
		});

		this.nextButton.on("click", function () {
			if (self.sliding) {
				return false;
			}

			if (self.timeout) {
				clearTimeout(self.timeout);
			}

			self.next({
				direction: "left",
				type: "next",
				context: self
			});
		});

		this.prevButton.on("click", function () {
			if (self.sliding) {
				return false;
			}

			if (self.timeout) {
				clearTimeout(self.timeout);
			}

			self.next({
				direction: "right",
				type: "prev",
				context: self
			});
		});

		this.sliderNav.find("li").each(function (index, dom) {
			$(dom).on("click", function () {
				if (self.sliding) {
					return false;
				}

				if (self.timeout) {
					clearTimeout(self.timeout);
				}

				self.fix(index);
			});
		});

		window.onresize = function () {
			self.update();
		};

		return this;
	};

	Slider.prototype.carouselRun = function (isBindClick) {
		var self = this;

		this.timeout = setTimeout(function () {
			if (self.pauseCommonSlide) {
				return false;
			}

			self.next({
				direction: "left",
				type: "common",
				context: self
			});
		}, this.intervalTime);

		return this;
	};

	Slider.prototype.next = function (setting) {
		var self = setting.context;
		var slider = self.slider;
		var slideDeltaX = (setting.direction == "left") ? -self.slideDeltaX : self.slideDeltaX;
		var newLi = null;
		var marginLeft = 0;

		if (setting.direction == "left") {
			self.liIndex++;

			if (self.liIndex >= self.CarouselCount) {
				self.liIndex = 0;
			}
		} else if (setting.direction == "right") {
			self.liIndex--;

			if (self.liIndex <= -1) {
				self.liIndex = self.CarouselCount - 1;
			}
		}

		self.sliding = true;
		self.slideType = setting.type;
		self.sliderNav.find("li").removeClass("active");
		self.sliderNav.find("li").eq(self.liIndex).addClass("active");

		switch (setting.direction) {
			case "left" : left(); break;
			case "right" : right(); break;
		};

		function left () {
			var firstLi = slider.find("li:first");

			self.timer = setInterval(function () {
				marginLeft = parseInt(firstLi.css("marginLeft"));
				self.animateCounter++;

				if (self.animateCounter == self.AnimateCount) {
					firstLi.css({
						marginLeft: -firstLi.width()
					});

					newLi = firstLi.clone(true, true).css("marginLeft", "0px");
					firstLi.remove();
					slider.append(newLi);
					self.animateCounter = 0;
					clearInterval(self.timer);
					delete self.timer;
					delete self.timeout;
					self.sliding = false;

					if (self.updateDelay) {
						self.updateDelay();
					}

					if (!self.pauseCommonSlide) {
						self.carouselRun();
					}
				} else {
					firstLi.css({
						marginLeft: marginLeft + slideDeltaX
					});
				}
			}, self.setting.frameTime);
		};
		function right () {
			var lastLi = slider.find("li:last");

			newLi = lastLi.clone(true, true).css("marginLeft", -lastLi.width());
			lastLi.remove();
			slider.prepend(newLi);

			var firstLi = slider.find("li:first");

			self.timer = setInterval(function () {
				marginLeft = parseInt(firstLi.css("marginLeft"));
				self.animateCounter++;

				if (self.animateCounter == self.AnimateCount) {
					firstLi.css({
						marginLeft: '0px'
					});

					self.animateCounter = 0;
					clearInterval(self.timer);
					delete self.timer;
					delete self.timeout;
					self.sliding = false;

					if (self.updateDelay) {
						self.updateDelay();
					}

					if (!self.pauseCommonSlide) {
						self.carouselRun();
					}
				} else {
					firstLi.css({
						marginLeft: marginLeft + slideDeltaX
					});
				}
			}, self.setting.frameTime);
		};
	};

	Slider.prototype.multiNext = function (setting) {
		var self = setting.context;
		var slider = self.slider;
		var slideDeltaX = (setting.direction == "left") ? -self.slideDeltaX : self.slideDeltaX;
		var sliderLeft = parseInt(slider.css("left"));
		var replaceImg = self.sliderContainer.children("img:first");
		var replaceImgLeft = parseInt(replaceImg.css("left"));

		self.sliding = true;
		self.liIndex = setting.clickIndex;
		self.sliderNav.find("li").removeClass("active");
		self.sliderNav.find("li").eq(self.liIndex).addClass("active");

		self.timer = setInterval(function () {
			sliderLeft = parseInt(slider.css("left"));
			replaceImgLeft = parseInt(replaceImg.css("left"));
			self.animateCounter++;

			if (self.animateCounter == self.AnimateCount) {
				replaceImg.css({
					left: (setting.direction == "left") ? -slider.find("li").width() : slider.find("li").width()
				});

				slider.css({
					left: 0
				});

				replaceImg.remove();
				self.animateCounter = 0;
				clearInterval(self.timer);
				delete self.timer;
				delete self.timeout;
				self.sliding = false;

				if (self.updateDelay) {
					self.updateDelay();
				}

				if (!self.pauseCommonSlide) {
					self.carouselRun();
				}
			} else {
				slider.css({
					left: sliderLeft + slideDeltaX
				});

				replaceImg.css({
					left: replaceImgLeft + slideDeltaX
				});
			}
		}, self.setting.frameTime);
	};

	Slider.prototype.fix = function (clickIndex) {
		var sliderContainer = this.sliderContainer;
		var slider = this.slider;
		var type = clickIndex - this.liIndex > 0 ? 'next' : clickIndex - this.liIndex == 0 ? "static" : "prev";

		if (this.liIndex == clickIndex) {
			return false;
		}

		if (this.sliding) {
			return false;
		}

		if (this.liIndex - clickIndex == 1) {
			this.next({
				direction: "right",
				type: "prev",
				context: this
			});

			return false;
		} else if (this.liIndex - clickIndex == -1) {
			this.next({
				direction: "left",
				type: "next",
				context: this
			});

			return false;
		}

		if (Math.abs(clickIndex - this.liIndex ) > 1) {
			var replaceImg = slider.find("li").eq(0).find("img").clone(true, true);

			replaceImg.css({
				width: slider.find("li").width(),
				height: slider.find("li").height(),
				position: "absolute",
				top: "0px",
				left: "0px"
			}).appendTo(sliderContainer);

			if (type == "next") {
				slider.css("left", slider.find("li").width());
			} else if (type == "prev") {
				slider.css("left", -slider.find("li").width());
			}

			var beforeLis = slider.find("li").slice(0, clickIndex - this.liIndex).clone(true, true);
			var afterLis = slider.find("li").slice(clickIndex - this.liIndex, this.CarouselCount).clone(true, true);

			slider.find("li").remove();
			slider.append(afterLis).append(beforeLis);

			if (type == "next") {
				this.multiNext({
					context: this,
					direction: "left",
					type: "multiLeft",
					clickIndex: clickIndex
				});
			} else if (type == "prev") {
				this.multiNext({
					context: this,
					direction: "right",
					type: "multiRight",
					clickIndex: clickIndex
				});
			}
		}
	};

	$.fn.extend({
		slider: function () {
			var setting, type;

			if (arguments.length == 2 && !this[0].sliderObj) {
				return false;
			}

			if (arguments.length == 1) {
				setting = arguments[0];
			} else if (arguments.length == 2) {
				type = arguments[0];
				setting = arguments[1];

				this[0].sliderObj[type](setting);
			}

			if (!this[0].sliderObj) {
				this[0].sliderObj = new Slider(this ,setting);
			}
		}
	});
})(jQuery);