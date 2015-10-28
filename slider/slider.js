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
		this.carouselType = setting.carouselType;
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
			clearInterval(self.timer);
			clearTimeout(self.timeout);
			delete self.timeout;
			delete self.timer;
			self.carousel.css("left", 0);

			if (setting.intervalTime) {
				self.intervalTime = setting.intervalTime;
			}

			if (setting.animateTime) {
				self.animateTime = setting.animateTime;
			}

			if (setting.frameTime) {
				self.frameTime = setting.frameTime;
			}

			if (setting.carouselType) {
				self.carouselType = setting.carouselType;
			}

			if (setting.indicatorsType == "round") {
				self.sliderNav.addClass("round");
			} else if (setting.indicatorsType == "rectangle") {
				self.sliderNav.removeClass("round");
			}

			self.animateCounter = 0;
			self.liIndex = 0;
			self.sliding = false;
			self.pauseCommonSlide = false;
			self.sliderNav.find("li").removeClass("active");
			self.sliderNav.find("li").eq(self.liIndex).addClass("active");
			self.AnimateCount = self.animateTime / self.frameTime;
			self.slideDeltaX = Math.floor(self.slider.width() / self.AnimateCount);

			self.carouselRun();
		};

		updateInner();
	};

	Slider.prototype.destroy = function () {
		this.slider.empty();
		clearInterval(this.timer);
		clearTimeout(this.timeout);
		delete this.timeout;
		delete this.timer;
		delete this.slider[0].sliderObj;
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

	Slider.prototype.carouselRun = function () {
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

		if (setting.direction == "left") {
			self.liIndex++;

			if (self.liIndex == self.CarouselCount) {
				self.replaceImg = $("<img src='"+ carousel.find("li").eq(self.CarouselCount - 1).find("img").attr("src") +"'/>")
									.css({
										position: "absolute",
										width: "100%",
										height: "100%",
										left: "0px",
										top: "0px"
									});

				self.slider.append(self.replaceImg);
				carousel.css("left", carousel.find("li").width());
				self.liIndex = 0;
			}
		} else if (setting.direction == "right") {
			self.liIndex--;

			if (self.liIndex == -1) {
				self.replaceImg = $("<img src='"+ carousel.find("li").eq(0).find("img").attr("src") +"'/>")
					.css({
						position: "absolute",
						width: "100%",
						height: "100%",
						left: "0px",
						top: "0px"
					});

				self.slider.append(self.replaceImg);
				carousel.css("left", -carousel.find("li").width() * self.CarouselCount);
			}

			self.liIndex = self.liIndex <= -1 ? self.CarouselCount - 1 : self.liIndex;
		}

		self.sliding = true;
		self.slideType = setting.type;
		self.sliderNav.find("li").removeClass("active");
		self.sliderNav.find("li").eq(self.liIndex).addClass("active");

		self.timer = setInterval(function () {
			self.animateCounter++;

			if (self.animateCounter % self.AnimateCount == 0) {
				carousel.css("left", -carousel.find("li").width() * self.liIndex);
				self.animateCounter = 0;

				if (self.replaceImg) {
					self.replaceImg.remove();
				}

				clearInterval(self.timer);
				delete self.timer;
				delete self.timeout;
				delete self.replaceImg;
				self.sliding = false;

				if (!self.pauseCommonSlide) {
					self.carouselRun();
				}
			} else {
				carousel.css("left", parseInt(carousel.css("left")) + slideDeltaX);

				if (self.replaceImg) {
					self.replaceImg.css("left", parseInt(self.replaceImg.css("left")) + slideDeltaX);
				}
			}
		}, self.setting.frameTime);
	};

	Slider.prototype.multiNext = function (setting) {
		var self = setting.context;
		var carousel = self.carousel;
		var slideDeltaX = (setting.direction == "left") ? -self.slideDeltaX : self.slideDeltaX;
		var sliderLeft = parseInt(carousel.css("left"));
		var replaceImg = null;
		var replaceImgLeft = 0;
		var slideCount = Math.abs(setting.clickIndex - self.liIndex);
		var AnimateCount = self.carouselType == "multi" ? self.AnimateCount * slideCount : self.AnimateCount;

		if (self.carouselType == "single") {
			replaceImg = self.carousel.find("img").eq(self.liIndex).clone(true, true);

			replaceImg.css({
				width: carousel.find("li").width(),
				height: carousel.find("li").height(),
				position: "absolute",
				top: "0px",
				left: "0px"
			}).appendTo(self.slider);

			if (setting.direction == "left") {
				carousel.css("left", -(setting.clickIndex - 1) * carousel.find("li").width());
			} else if (setting.direction == "right") {
				carousel.css("left", -(setting.clickIndex + 1) * carousel.find("li").width());
			}

		}

		self.sliding = true;
		self.liIndex = setting.clickIndex;
		self.sliderNav.find("li").removeClass("active");
		self.sliderNav.find("li").eq(self.liIndex).addClass("active");

		self.timer = setInterval(function () {
			sliderLeft = parseInt(carousel.css("left"));

			if (self.carouselType == "single") {
				replaceImgLeft = parseInt(replaceImg.css("left"));
			}

			self.animateCounter++;

			if (self.animateCounter >= AnimateCount) {
				carousel.css("left", (setting.direction == "left") ? -carousel.find("li").width() * self.liIndex : carousel.find("li").width() * self.liIndex);

				if (self.carouselType == "single") {
					replaceImg.remove();
				}

				self.animateCounter = 0;
				clearInterval(self.timer);
				delete self.timer;
				delete self.timeout;
				self.sliding = false;

				if (!self.pauseCommonSlide) {
					self.carouselRun();
				}
			} else {
				carousel.css("left", sliderLeft + slideDeltaX);

				if (self.carouselType == "single") {
					replaceImg.css("left", replaceImgLeft + slideDeltaX);
				}
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

			if (arguments.length == 1 && typeof arguments[0] == "object") {
				if (!this[0].sliderObj) {
					this[0].sliderObj = new Slider(this ,arguments[0]);
				}
			} else {
				type = arguments[0];
				setting = arguments[1];

				this[0].sliderObj[type](setting);
			}
		}
	});
})(jQuery);