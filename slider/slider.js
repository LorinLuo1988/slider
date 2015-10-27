/**
 * Created by doyen on 2015/10/20.
 */
(function ($) {
	function Slider (slider ,setting) {
		this.slider = slider;
		this.nextButton = null;
		this.prevButton = null;
		this.carousel = null;
		this.sliderNav = null;
		this.imgArr = setting.imgArr;
		this.setting = setting;
		this.timer = null;
		this.indicatorsType = setting.indicatorsType;
		this.intervalTime = this.setting.intervalTime;
		this.animateTime = this.setting.animateTime;
		this.frameTime = this.setting.frameTime;
		this.AnimateCount = this.animateTime / this.frameTime;
		this.slideDeltaX = Math.floor(this.slider.width() / this.AnimateCount);
		this.liIndex = 0;
		this.CarouselCount = this.imgArr.length;
		this.animateCounter = 0;
		this.sliding = false;
		this.pauseCommonSlide = false;

		this.initialize();
	};

	Slider.prototype.update = function (setting) {
		var self = this;

		setting = setting || {};

		function updateInner () {
			if (setting.intervalTime) {
				self.intervalTime = setting.intervalTime;
			}

			if (setting.animateTime) {
				self.animateTime = setting.animateTime;
			}

			if (setting.frameTime) {
				self.frameTime = setting.frameTime;
			}

			if (setting.indicatorsType == "round") {
				self.sliderNav.addClass("round");
			} else if (setting.indicatorsType == "rectangle") {
				self.sliderNav.removeClass("round");
			}

			self.AnimateCount = self.animateTime / self.frameTime;
			self.slideDeltaX = Math.floor(self.slider.width() / self.AnimateCount);
		};

		if (this.sliding) {
			this.updateDelay = function () {
				updateInner();

				delete this.updateDelay;
			}

			return false;
		}

		updateInner();
	};

	Slider.prototype.initialize = function () {
		this.crateModule().setDefaultStyle().registerEvent().carouselRun();

		return this;
	};

	Slider.prototype.crateModule = function () {
		var imgArr = this.imgArr;
		var length = imgArr.length;

		this.carousel = $("<ul class='carousel'></ul>");
		this.sliderNav = $("<ul class='slider-nav'></ul>");

		for (var i = 0; i < length; i++) {
			this.carousel.append($("<li><img src=" + imgArr[i] +" alt=''/></li>"));
			this.sliderNav.append($("<li></li>"));
		}

		this.nextButton = $("<button class='slider-next'>&gt;</button>");
		this.prevButton = $("<button class='slider-prev'>&lt;</button>");

		this.slider.append(this.carousel).append(this.sliderNav)
			.append(this.prevButton).append(this.nextButton);

		return this;
	};

	Slider.prototype.setDefaultStyle = function () {
		var carouselLiCount = this.carousel.find("li").length;
		var indicatorsType = this.indicatorsType || "rectangle";

		this.carousel.css("width", carouselLiCount * 100 + "%");

		this.carousel.find("li").css("width", 100 / carouselLiCount + "%");

		this.sliderNav.find("li:first").addClass("active");

		this.sliderNav.addClass(indicatorsType);

		return this;
	};

	Slider.prototype.registerEvent = function () {
		var self = this;

		this.slider.on("mouseenter", function () {
			$(this).find("button.slider-prev, button.slider-next").css("display", "block");
			clearTimeout(self.timeout);
			self.pauseCommonSlide = true;
		});

		this.slider.on("mouseleave", function () {
			$(this).find("button.slider-prev, button.slider-next").css("display", "none");
			self.pauseCommonSlide = false;

			if (self.animateCounter == 0) {
				self.carouselRun();
			}
		});

		this.nextButton.on("click", function () {
			if (self.sliding) {
				return false;
			}

			clearTimeout(self.timeout);

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

			clearTimeout(self.timeout);

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

				clearTimeout(self.timeout);

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
		var carousel = self.carousel;
		var slideDeltaX = (setting.direction == "left") ? -self.slideDeltaX : self.slideDeltaX;
		var marginLeft = 0;

		if (setting.direction == "left") {
			self.liIndex++;
			self.liIndex = self.liIndex >= self.CarouselCount ? 0 : self.liIndex;
		} else if (setting.direction == "right") {
			self.liIndex--;
			self.liIndex = self.liIndex <= -1 ? self.CarouselCount - 1 : self.liIndex;
		}

		self.sliding = true;
		self.slideType = setting.type;
		self.sliderNav.find("li").removeClass("active");
		self.sliderNav.find("li").eq(self.liIndex).addClass("active");

		if (setting.direction == "right") {
			var lastLi = carousel.find("li:last");

			var newLi = lastLi.clone(true, true).css("marginLeft", -lastLi.width());
			lastLi.remove();
			carousel.prepend(newLi);
		}

		var firstLi = carousel.find("li:first");

		self.timer = setInterval(function () {
			marginLeft = parseInt(firstLi.css("marginLeft"));
			self.animateCounter++;

			if (self.animateCounter == self.AnimateCount) {
				if (setting.direction == "left") {
					firstLi.css("marginLeft", -firstLi.width());
					newLi = firstLi.clone(true, true).css("marginLeft", "0px");
					firstLi.remove();
					carousel.append(newLi);
				} else if (setting.direction == "right") {
					firstLi.css("marginLeft", '0px');
				}

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
				firstLi.css("marginLeft", marginLeft + slideDeltaX);
			}
		}, self.setting.frameTime);
	};

	Slider.prototype.multiNext = function (setting) {
		var self = setting.context;
		var carousel = self.carousel;
		var slideDeltaX = (setting.direction == "left") ? -self.slideDeltaX : self.slideDeltaX;
		var sliderLeft = parseInt(carousel.css("left"));
		var replaceImg = self.slider.children("img:first");
		var replaceImgLeft = parseInt(replaceImg.css("left"));

		self.sliding = true;
		self.liIndex = setting.clickIndex;
		self.sliderNav.find("li").removeClass("active");
		self.sliderNav.find("li").eq(self.liIndex).addClass("active");

		self.timer = setInterval(function () {
			sliderLeft = parseInt(carousel.css("left"));
			replaceImgLeft = parseInt(replaceImg.css("left"));
			self.animateCounter++;

			if (self.animateCounter == self.AnimateCount) {
				replaceImg.css("left", (setting.direction == "left") ? -carousel.find("li").width() : carousel.find("li").width());
				carousel.css("left", 0);
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
				carousel.css("left", sliderLeft + slideDeltaX);
				replaceImg.css("left", replaceImgLeft + slideDeltaX);
			}
		}, self.setting.frameTime);
	};

	Slider.prototype.fix = function (clickIndex) {
		var slider = this.slider;
		var carousel = this.carousel;
		var type = clickIndex - this.liIndex > 0 ? 'next' : clickIndex - this.liIndex == 0 ? "static" : "prev";

		if (this.liIndex == clickIndex) {
			return false;
		}

		if (this.sliding) {
			return false;
		}

		if (Math.abs(this.liIndex - clickIndex) == 1) {
			this.next({
				direction: this.liIndex - clickIndex == 1 ? "right" : "left",
				type: "prev",
				context: this
			});

			return false;
		}

		if (Math.abs(clickIndex - this.liIndex ) > 1) {
			var replaceImg = carousel.find("li").eq(0).find("img").clone(true, true);

			replaceImg.css({
				width: carousel.find("li").width(),
				height: carousel.find("li").height(),
				position: "absolute",
				top: "0px",
				left: "0px"
			}).appendTo(slider);

			carousel.css("left", type == "next" ? carousel.find("li").width() : -carousel.find("li").width());

			var beforeLis = carousel.find("li").slice(0, clickIndex - this.liIndex).clone(true, true);
			var afterLis = carousel.find("li").slice(clickIndex - this.liIndex, this.CarouselCount).clone(true, true);

			carousel.find("li").remove().end().append(afterLis).append(beforeLis);

			this.multiNext({
				context: this,
				direction: type == "next" ? "left" : "right",
				type: type == "next" ? "multiLeft" : "multiRight",
				clickIndex: clickIndex
			});
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