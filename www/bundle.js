/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _Explore = __webpack_require__(1);

	var _util = __webpack_require__(3);

	__webpack_require__(18);

	var app = app || {}; //  weak 

	app.main = function () {

	  console.log('app.main.init');

	  function render() {

	    console.log('render');

	    var elementsContainer = document.createElement('div');

	    // Curated
	    var curatedNav = document.createElement('div');
	    var curatedTitle = document.createElement('h3');
	    curatedTitle.innerHTML = 'Curated';
	    curatedNav.appendChild(curatedTitle);

	    var test1 = document.createElement('button');
	    test1.innerHTML = _util.terms[18].name + ' in ' + _util.countries[10].name;
	    test1.addEventListener('click', function (e) {
	      return explore.loadCurated({ terms: [_util.terms[18]], geo: _util.countries[10] });
	    });
	    curatedNav.appendChild(test1);

	    var test2 = document.createElement('button');
	    test2.innerHTML = _util.terms[12].name + ' in ' + _util.countries[234].name;
	    test2.addEventListener('click', function (e) {
	      return explore.loadCurated({ terms: [_util.terms[12]], geo: _util.countries[234] });
	    });
	    curatedNav.appendChild(test2);

	    elementsContainer.appendChild(curatedNav);

	    // Explore
	    var explore = new _Explore.Explore(elementsContainer);

	    var body = document.querySelector('body');
	    if (body) {
	      body.appendChild(elementsContainer);
	    }
	  }

	  var init = function init() {
	    console.log('Initializing app.');
	    render();
	  };

	  return {
	    init: init
	  };
	}();

	window.addEventListener('DOMContentLoaded', app.main.init);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Explore = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //  weak

	var _FiltersMenu = __webpack_require__(2);

	var _LineChart = __webpack_require__(4);

	var _util = __webpack_require__(3);

	var _TrendsAPI = __webpack_require__(6);

	var _d = __webpack_require__(5);

	var d3 = _interopRequireWildcard(_d);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Explore = exports.Explore = function () {
	  function Explore(parentContainer, data) {
	    _classCallCheck(this, Explore);

	    if (data) {
	      this.data = data;
	    } else {
	      this.data = {
	        prevDiseases: [_util.terms[0]],
	        diseases: [_util.terms[0]],
	        prevGeo: _util.countries[0],
	        geo: _util.countries[0],
	        seasonal: [],
	        trend: [],
	        total: [],
	        merged: false
	      };
	    }
	    this.trendsAPI = new _TrendsAPI.TrendsAPI();
	    this.addShinyListeners();
	    this.createElements(parentContainer);
	  }

	  _createClass(Explore, [{
	    key: 'addShinyListeners',
	    value: function addShinyListeners() {
	      var self = this;

	      $(document).on('shiny:connected', function (event) {
	        console.log('Connected to Shiny server');
	      });

	      $(document).on('shiny:sessioninitialized', function (event) {
	        console.log('Shiny session initialized');

	        // Create a loop to ping the Shiny server and keep the websocket connection on
	        clearInterval(self.keepShinyAlive);
	        self.keepShinyAlive = setInterval(pingShiny, 10000);
	        function pingShiny() {
	          var timestamp = Date.now();
	          Shiny.onInputChange("ping", timestamp);
	        }

	        // Add listener for stl data
	        Shiny.addCustomMessageHandler("stl", function (dataFromR) {
	          console.log('From R: ', dataFromR);
	          self.parseRData(dataFromR);
	        });
	      });

	      $(document).on('shiny:idle', function (event) {
	        console.log('Shiny session idle');
	      });

	      $(document).on('shiny:disconnected', function (event) {
	        console.log('Disconnected from Shiny server');
	        location.reload();
	      });
	    }
	  }, {
	    key: 'handleSelectDiseaseChange',
	    value: function handleSelectDiseaseChange(event, self) {
	      var value = event.target.value;

	      var name = this.getSelectedText(event.target);
	      this.updateData({ diseases: [{ entity: value, name: name }] });
	      self.confirmNav.classList.remove('hidden');
	    }
	  }, {
	    key: 'handleSelectGeoChange',
	    value: function handleSelectGeoChange(event, self) {
	      var value = event.target.value;

	      var name = this.getSelectedText(event.target);
	      this.updateData({ geo: { iso: value, name: name } });
	      self.confirmNav.classList.remove('hidden');
	    }
	  }, {
	    key: 'getSelectedText',
	    value: function getSelectedText(el) {
	      if (el.selectedIndex == -1) return null;
	      return el.options[el.selectedIndex].text;
	    }
	  }, {
	    key: 'cancelFilters',
	    value: function cancelFilters(event, self) {
	      var _self$data = self.data,
	          prevDiseases = _self$data.prevDiseases,
	          prevGeo = _self$data.prevGeo;

	      self.confirmNav.classList.add('hidden');
	      self.updateData({ diseases: prevDiseases, geo: prevGeo });
	    }
	  }, {
	    key: 'confirmFilters',
	    value: function confirmFilters(event, self) {
	      var _self$data2 = self.data,
	          diseases = _self$data2.diseases,
	          geo = _self$data2.geo;

	      self.confirmNav.classList.add('hidden');
	      self.updateData({ prevDiseases: diseases, prevGeo: geo });
	      self.callTrendsApi();
	    }
	  }, {
	    key: 'toggleChartMerge',
	    value: function toggleChartMerge(event, self) {
	      var merged = self.data.merged;

	      merged = merged ? false : true;
	      this.seasonalChart.hide();
	      this.updateData({ merged: merged });
	    }
	  }, {
	    key: 'loadCurated',
	    value: function loadCurated(filter) {
	      var terms = filter.terms,
	          geo = filter.geo;

	      this.updateData({ prevDiseases: terms, diseases: terms, prevGeo: geo, geo: geo });
	      this.confirmNav.classList.add('hidden');
	      this.callTrendsApi();
	    }
	  }, {
	    key: 'callTrendsApi',
	    value: function callTrendsApi() {
	      var _data = this.data,
	          diseases = _data.diseases,
	          geo = _data.geo;

	      var self = this;

	      self.trendsAPI.getTrends({ terms: diseases, geo: geo }, function (val) {

	        var parseTime = d3.timeParse('%Y-%m-%d');
	        self.updateData({
	          total: val.lines[0].points.map(function (p, i) {
	            return { date: parseTime(p.date), value: p.value };
	          })
	        });

	        self.sendDataToR(val);
	      });
	    }
	  }, {
	    key: 'sendDataToR',
	    value: function sendDataToR(data) {
	      console.log('From Google Trends: ', data);

	      var dataToR = data.lines[0].points.map(function (p, i) {
	        return p.date + ',' + p.value;
	      });
	      // this.parseRData(dummyData);    
	      Shiny.onInputChange("mydata", dataToR);
	    }
	  }, {
	    key: 'parseRData',
	    value: function parseRData(dataFromR) {
	      var total = this.data.total;


	      var seasonalString = dataFromR.substring(dataFromR.indexOf('seasonal:') + 'seasonal:'.length + 1, dataFromR.indexOf('trend:'));
	      var seasonal = seasonalString.split(',').slice(0, 13).map(function (n, i) {
	        return { date: total[i].date, value: Number(n.trim()) };
	      });

	      var trendString = dataFromR.substring(dataFromR.indexOf('trend:') + 'trend:'.length + 1, dataFromR.length);
	      var trend = trendString.split(',').map(function (n, i) {
	        return { date: total[i].date, value: Number(n.trim()) };
	      });
	      this.updateData({ seasonal: seasonal, trend: trend });
	    }
	  }, {
	    key: 'createElements',
	    value: function createElements(parentContainer) {
	      var _this = this;

	      var elementsContainer = document.createElement('div');
	      elementsContainer.id = 'explore';

	      var filtersMenu = document.createElement('div');
	      filtersMenu.id = 'filters-menu';
	      elementsContainer.appendChild(filtersMenu);

	      var text1 = document.createElement('span');
	      text1.innerHTML = 'Search interest for ';
	      filtersMenu.appendChild(text1);

	      // Diseases
	      this.diseaseSelect = document.createElement('select');
	      var diseaseSelect = this.diseaseSelect;

	      diseaseSelect.name = 'disease-select';
	      _util.terms.forEach(function (d, i) {
	        var option = document.createElement('option');
	        option.setAttribute('value', d.entity);
	        option.setAttribute('key', i);
	        option.innerHTML = d.name;
	        diseaseSelect.appendChild(option);
	      });
	      var bindHandleChange = function bindHandleChange(evt) {
	        return _this.handleSelectDiseaseChange(evt, _this);
	      };
	      diseaseSelect.addEventListener('change', bindHandleChange);
	      filtersMenu.appendChild(diseaseSelect);

	      var text2 = document.createElement('span');
	      text2.innerHTML = ' in the ';
	      filtersMenu.appendChild(text2);

	      // Geo
	      this.geoSelect = document.createElement('select');
	      var geoSelect = this.geoSelect;

	      geoSelect.name = 'geo-select';
	      _util.countries.forEach(function (c, i) {
	        var option = document.createElement('option');
	        option.setAttribute('value', c.iso);
	        option.innerHTML = c.name;
	        geoSelect.appendChild(option);
	      });
	      bindHandleChange = function bindHandleChange(evt) {
	        return _this.handleSelectGeoChange(evt, _this);
	      };
	      geoSelect.addEventListener('change', bindHandleChange);
	      filtersMenu.appendChild(geoSelect);

	      // Cancel / Done
	      this.confirmNav = document.createElement('div');
	      var confirmNav = this.confirmNav;

	      confirmNav.id = 'confirm-nav';
	      confirmNav.classList.add('hidden');

	      var cancelButton = document.createElement('button');
	      cancelButton.innerHTML = 'Cancel';
	      bindHandleChange = function bindHandleChange(evt) {
	        return _this.cancelFilters(evt, _this);
	      };
	      cancelButton.addEventListener('click', bindHandleChange);
	      confirmNav.appendChild(cancelButton);

	      var doneButton = document.createElement('button');
	      doneButton.innerHTML = 'Done';
	      bindHandleChange = function bindHandleChange(evt) {
	        return _this.confirmFilters(evt, _this);
	      };
	      doneButton.addEventListener('click', bindHandleChange);
	      confirmNav.appendChild(doneButton);

	      filtersMenu.appendChild(confirmNav);

	      // Merge
	      this.mergeButton = document.createElement('button');
	      var mergeButton = this.mergeButton;

	      mergeButton.innerHTML = 'Merge Charts';
	      bindHandleChange = function bindHandleChange(evt) {
	        return _this.toggleChartMerge(evt, _this);
	      };
	      mergeButton.addEventListener('click', bindHandleChange);
	      elementsContainer.appendChild(mergeButton);

	      // Charts
	      this.seasonalChart = new _LineChart.LineChart(elementsContainer, 'seasonal');
	      this.trendChart = new _LineChart.LineChart(elementsContainer, 'trend');

	      parentContainer.appendChild(elementsContainer);
	    }
	  }, {
	    key: 'updateData',
	    value: function updateData(obj) {
	      var data = this.data;

	      for (var key in obj) {
	        data[key] = obj[key];
	      }
	      this.data = data;
	      console.log(this.data);
	      this.updateElements();
	    }
	  }, {
	    key: 'updateElements',
	    value: function updateElements() {
	      var data = this.data,
	          diseaseSelect = this.diseaseSelect,
	          geoSelect = this.geoSelect,
	          mergeButton = this.mergeButton,
	          seasonalChart = this.seasonalChart,
	          trendChart = this.trendChart;
	      var diseases = data.diseases,
	          geo = data.geo,
	          seasonal = data.seasonal,
	          trend = data.trend,
	          total = data.total,
	          merged = data.merged;


	      var diseaseOptions = diseaseSelect.children;
	      var _iteratorNormalCompletion = true;
	      var _didIteratorError = false;
	      var _iteratorError = undefined;

	      try {
	        for (var _iterator = diseaseOptions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	          var o = _step.value;

	          if (o.value === data.diseases[0].entity) {
	            o.selected = true;
	          }
	        }
	      } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion && _iterator.return) {
	            _iterator.return();
	          }
	        } finally {
	          if (_didIteratorError) {
	            throw _iteratorError;
	          }
	        }
	      }

	      var geoOptions = geoSelect.children;
	      var _iteratorNormalCompletion2 = true;
	      var _didIteratorError2 = false;
	      var _iteratorError2 = undefined;

	      try {
	        for (var _iterator2 = geoOptions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	          var _o = _step2.value;

	          if (_o.value === data.geo.iso) {
	            _o.selected = true;
	          }
	        }
	      } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion2 && _iterator2.return) {
	            _iterator2.return();
	          }
	        } finally {
	          if (_didIteratorError2) {
	            throw _iteratorError2;
	          }
	        }
	      }

	      mergeButton.innerHTML = merged ? 'Split Charts' : 'Merge Charts';

	      if (seasonal && trend && total) {
	        seasonalChart.updateData(seasonal);
	        merged ? trendChart.updateData(total) : trendChart.updateData(trend);
	      }
	    }
	  }]);

	  return Explore;
	}();

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.FiltersMenu = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //  weak

	var _util = __webpack_require__(3);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var FiltersMenu = exports.FiltersMenu = function () {
	  function FiltersMenu(parentContainer, diseases) {
	    _classCallCheck(this, FiltersMenu);

	    this.parentContainer = parentContainer;
	    this.diseases = diseases;
	  }

	  _createClass(FiltersMenu, [{
	    key: 'render',
	    value: function render() {
	      var parentContainer = this.parentContainer,
	          diseases = this.diseases;


	      var container = document.createElement('div');
	      container.id = 'filters-menu';
	      var elements = [];

	      var text1 = document.createElement('span');
	      text1.innerHTML = 'Search interest for ';
	      elements.push(text1);

	      var diseaseSelect = document.createElement('select');
	      diseases.forEach(function (d, i) {
	        var option = document.createElement('option');
	        option.setAttribute('value', d);
	        option.innerHTML = d;
	        diseaseSelect.appendChild(option);
	      });
	      elements.push(diseaseSelect);

	      var text2 = document.createElement('span');
	      text2.innerHTML = ' in the ';
	      elements.push(text2);

	      var countrySelect = document.createElement('select');
	      _util.countries.forEach(function (c, i) {
	        var option = document.createElement('option');
	        option.setAttribute('value', c.iso);
	        option.innerHTML = c.name;
	        countrySelect.appendChild(option);
	      });
	      elements.push(countrySelect);

	      elements.forEach(function (el, i) {
	        container.appendChild(el);
	      });

	      parentContainer.appendChild(container);
	    }
	  }]);

	  return FiltersMenu;
	}();

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var dummyData = exports.dummyData = "seasonal: 2.37263502514153, 4.30657893342439, 0.677967901184848, -1.8633757568252, -3.18612818802182, -3.89743932448122, -4.37499526602228, -3.65363561774542, -0.686480387754851, 4.54240542830846, 2.73201580997007, 3.03045133921252, 2.37263502514153, 4.30657893342439, 0.677967901184848, -1.8633757568252, -3.18612818802182, -3.89743932448122, -4.37499526602228, -3.65363561774542, -0.686480387754851, 4.54240542830846, 2.73201580997007, 3.03045133921252, 2.37263502514153, 4.30657893342439, 0.677967901184848, -1.8633757568252, -3.18612818802182, -3.89743932448122, -4.37499526602228, -3.65363561774542, -0.686480387754851, 4.54240542830846, 2.73201580997007, 3.03045133921252, 2.37263502514153, 4.30657893342439, 0.677967901184848, -1.8633757568252, -3.18612818802182, -3.89743932448122, -4.37499526602228, -3.65363561774542, -0.686480387754851, 4.54240542830846, 2.73201580997007, 3.03045133921252, 2.37263502514153, 4.30657893342439, 0.677967901184848, -1.8633757568252, -3.18612818802182, -3.89743932448122, -4.37499526602228, -3.65363561774542, -0.686480387754851, 4.54240542830846, 2.73201580997007, 3.03045133921252, 2.37263502514153, 4.30657893342439, 0.677967901184848, -1.8633757568252, -3.18612818802182, -3.89743932448122, -4.37499526602228, -3.65363561774542, -0.686480387754851, 4.54240542830846, 2.73201580997007, 3.03045133921252, 2.37263502514153, 4.30657893342439, 0.677967901184848, -1.8633757568252, -3.18612818802182, -3.89743932448122, -4.37499526602228, -3.65363561774542, -0.686480387754851, 4.54240542830846, 2.73201580997007, 3.03045133921252, 2.37263502514153, 4.30657893342439, 0.677967901184848, -1.8633757568252, -3.18612818802182, -3.89743932448122, -4.37499526602228, -3.65363561774542, -0.686480387754851, 4.54240542830846, 2.73201580997007, 3.03045133921252, 2.37263502514153, 4.30657893342439, 0.677967901184848, -1.8633757568252, -3.18612818802182, -3.89743932448122, -4.37499526602228, -3.65363561774542, -0.686480387754851, 4.54240542830846, 2.73201580997007, 3.03045133921252, 2.37263502514153, 4.30657893342439, 0.677967901184848, -1.8633757568252, -3.18612818802182, -3.89743932448122, -4.37499526602228, -3.65363561774542, -0.686480387754851, 4.54240542830846, 2.73201580997007, 3.03045133921252, 2.37263502514153, 4.30657893342439, 0.677967901184848, -1.8633757568252, -3.18612818802182, -3.89743932448122, -4.37499526602228, -3.65363561774542, -0.686480387754851, 4.54240542830846, 2.73201580997007, 3.03045133921252, 2.37263502514153, 4.30657893342439, 0.677967901184848, -1.8633757568252, -3.18612818802182, -3.89743932448122, -4.37499526602228, -3.65363561774542, -0.686480387754851, 4.54240542830846, 2.73201580997007, 3.03045133921252, 2.37263502514153, 4.30657893342439, 0.677967901184848, -1.8633757568252, -3.18612818802182, -3.89743932448122, -4.37499526602228, -3.65363561774542, -0.686480387754851, 4.54240542830846, 2.73201580997007, 3.03045133921252, 2.37263502514153, 4.30657893342439, 0.677967901184848, -1.8633757568252 trend: 7.21790482156164, 7.11856646184706, 7.01922810213247, 6.94795717001788, 6.8766862379033, 6.84306603135029, 6.80944582479728, 6.96614972358897, 7.12285362238065, 7.31686225388064, 7.51087088538064, 7.64061724335883, 7.77036360133702, 7.87393051286943, 7.97749742440184, 8.10947206316905, 8.24144670193626, 8.58039898682091, 8.91935127170556, 9.58693952445866, 10.2545277772118, 11.0141555447714, 11.773783312331, 12.2818877600105, 12.78999220769, 12.6689665325011, 12.5479408573123, 11.9593813109, 11.3708217644876, 10.8017807171563, 10.232739669825, 9.62347673099186, 9.01421379215878, 8.56918709596123, 8.12416039976369, 7.8754630557467, 7.62676571172972, 7.47828975168461, 7.3298137916395, 7.2395297573835, 7.1492457231275, 7.18903275482903, 7.22881978653055, 7.21320224590624, 7.19758470528192, 7.17108474887752, 7.14458479247311, 7.14125144148877, 7.13791809050443, 7.16019366370689, 7.18246923690935, 7.21570498919263, 7.24894074147591, 7.32948795231759, 7.41003516315928, 7.53209648225835, 7.65415780135742, 7.90700620057981, 8.15985459980221, 12.3810792402549, 16.6023038807075, 21.8020839601187, 27.0018640395299, 31.2618333483277, 35.5218026571255, 35.8763182983257, 36.2308339395259, 32.5031642153337, 28.7754944911414, 24.7975477703457, 20.81960104955, 17.8172290545934, 14.8148570596367, 13.2952132811134, 11.7755695025901, 10.609313541217, 9.44305757984386, 8.86982694738349, 8.29659631492311, 8.30630669116416, 8.31601706740521, 8.21482394813845, 8.11363082887168, 8.00752214566934, 7.901413462467, 7.85966077988896, 7.81790809731093, 7.81540828320901, 7.81290846910708, 7.7501167230969, 7.68732497708672, 7.46917819550625, 7.25103141392578, 7.03727375614998, 6.82351609837418, 6.79760866071652, 6.77170122305886, 6.90901198200128, 7.0463227409437, 7.33799662646265, 7.6296705119816, 7.90165165495852, 8.17363279793543, 8.31518247682774, 8.45673215572006, 8.52641500096415, 8.59609784620823, 8.63792587712559, 8.67975390804294, 8.73439903768847, 8.789044167334, 8.81278938530706, 8.83653460328011, 8.81383078302955, 8.79112696277899, 8.76121821061039, 8.73130945844178, 8.62647158007799, 8.5216337017142, 8.51129689357229, 8.50096008543039, 8.52428127537915, 8.54760246532791, 8.65271057027481, 8.75781867522171, 9.09650889300466, 9.43519911078761, 9.9130371499743, 10.390875189161, 10.7576899807969, 11.1245047724327, 11.2044183684068, 11.2843319643809, 11.27798784723, 11.271643730079, 11.0581049746535, 10.8445662192279, 10.3792708649795, 9.91397551073102, 9.52361831040128, 9.13326111007154, 9.01316452586334, 8.89306794165515, 9.00505078812941, 9.11703363460367, 9.24211251966252, 9.36719140472137, 9.62805656043914, 9.88892171615692, 10.0470880828981, 10.2052544496392, 10.2372724083489, 10.2692903670586, 10.4634504533666, 10.6576105396746, 10.811218923762, 10.9648273078494, 11.1394725094136, 11.3141177109778, 11.5027423499328";

	var terms = exports.terms = [{ name: "10th Cranial Nerve Disorder", entity: "/m/0hsr953" }, { name: "10th Cranial Nerve Disorder", entity: "/m/0hsr4wp" }, { name: "10th Cranial Nerve Disorder", entity: "/m/0hsr4fm" }, { name: "10th Cranial Nerve Disorder", entity: "/m/0hsr1v8" }, { name: "11th Cranial Nerve Disorder", entity: "/m/0hsr956" }, { name: "11th Cranial Nerve Disorder", entity: "/m/0hsr4wz" }, { name: "11th Cranial Nerve Disorder", entity: "/m/0hsr4fq" }, { name: "11th Cranial Nerve Disorder", entity: "/m/0hsr1vf" }, { name: "12th Cranial Nerve Disorder", entity: "/m/0hsr95b" }, { name: "12th Cranial Nerve Disorder", entity: "/m/0hsr4x4" }, { name: "12th Cranial Nerve Disorder", entity: "/m/0hsr4ft" }, { name: "12th Cranial Nerve Disorder", entity: "/m/0hsr1vk" }, { name: "3rd Cranial Nerve Disorder", entity: "/m/0hsr92m" }, { name: "3rd Cranial Nerve Disorder", entity: "/m/0hsr4vt" }, { name: "3rd Cranial Nerve Disorder", entity: "/m/0hsr4dx" }, { name: "3rd Cranial Nerve Disorder", entity: "/m/0hsr1s3" }, { name: "4th Cranial Nerve Disorder", entity: "/m/0hsr949" }, { name: "4th Cranial Nerve Disorder", entity: "/m/0hsr4vx" }, { name: "4th Cranial Nerve Disorder", entity: "/m/0hsr4d_" }, { name: "4th Cranial Nerve Disorder", entity: "/m/0hsr1sq" }, { name: "5th Cranial Nerve Disorder", entity: "/m/0hsr94t" }, { name: "5th Cranial Nerve Disorder", entity: "/m/0hsr4v_" }, { name: "5th Cranial Nerve Disorder", entity: "/m/0hsr4f2" }, { name: "5th Cranial Nerve Disorder", entity: "/m/0hsr1t9" }, { name: "6th Cranial Nerve Disorder", entity: "/m/0hsr94x" }, { name: "6th Cranial Nerve Disorder", entity: "/m/0hsr4w2" }, { name: "6th Cranial Nerve Disorder", entity: "/m/0hsr4ff" }, { name: "6th Cranial Nerve Disorder", entity: "/m/0hsr1t_" }, { name: "9th Cranial Nerve Disorder", entity: "/m/0hsr950" }, { name: "9th Cranial Nerve Disorder", entity: "/m/0hsr4wl" }, { name: "9th Cranial Nerve Disorder", entity: "/m/0hsr4fj" }, { name: "9th Cranial Nerve Disorder", entity: "/m/0hsr1v3" }, { name: "Aaron's sign", entity: "/m/059s97" }, { name: "Abadie's sign of exophthalmic goiter", entity: "/m/059sgd" }, { name: "Abadie's sign of tabes dorsalis", entity: "/m/059skz" }, { name: "Abarognosis", entity: "/m/08gh0x" }, { name: "Abasia", entity: "/m/07x_xw" }, { name: "Abcess", entity: "/m/0lxt" }, { name: "Abdominal angina", entity: "/m/0ft1_3" }, { name: "Abdominal distension", entity: "/m/09d7vk" }, { name: "Abdominal fullness", entity: "/m/0dl9shd" }, { name: "Abdominal guarding", entity: "/m/02r0j6j" }, { name: "Abdominal mass", entity: "/m/0b8v9f" }, { name: "Abdominal migraine", entity: "/m/0kfyl_5" }, { name: "Abdominal obesity", entity: "/m/0f8fc" }, { name: "Abdominal pain", entity: "/m/02tfl8" }, { name: "Abdominal tenderness", entity: "/m/075qhwp" }, { name: "Abnormal basal metabolic rate", entity: "/m/08x47t" }, { name: "Abnormal Chest Examination", entity: "/m/0hsr95f" }, { name: "Abnormal Chest Examination", entity: "/m/0hsr4x7" }, { name: "Abnormal Chest Examination", entity: "/m/0hsr4fy" }, { name: "Abnormal Chest Examination", entity: "/m/0hsr1wd" }, { name: "Abnormal location of the urethral meatus", entity: "/m/07719ls" }, { name: "Abnormal posturing", entity: "/m/08hpp7" }, { name: "Abnormal Splitting of Heart Sounds", entity: "/m/0hsr95j" }, { name: "Abnormal Splitting of Heart Sounds", entity: "/m/0hsr4xb" }, { name: "Abnormal Splitting of Heart Sounds", entity: "/m/0hsr4g8" }, { name: "Abnormal Splitting of Heart Sounds", entity: "/m/0hsr1xr" }, { name: "Abnormal taste", entity: "/m/0dl9tdc" }, { name: "Abnormal vaginal bleeding", entity: "/m/0dl9t6f" }, { name: "Abnormal vaginal discharge", entity: "/m/03wygd_" }, { name: "Abnormality in fetal heart rate or rhythm", entity: "/m/07vwm57" }, { name: "Abscess", entity: "/m/0lxt" }, { name: "Absence of Uvula", entity: "/m/0hsr95m" }, { name: "Absence of Uvula", entity: "/m/0hsr4xn" }, { name: "Absence of Uvula", entity: "/m/0hsr4gc" }, { name: "Absence of Uvula", entity: "/m/0hsr1yb" }, { name: "Absent p waves", entity: "/m/06b0xnh" }, { name: "Absent tears", entity: "/m/076rfy3" }, { name: "Absent-mindedness", entity: "/m/026__2h" }, { name: "Acalculia", entity: "/m/025sjm9" }, { name: "Acanthocyte", entity: "/m/06nyl4" }, { name: "Acanthosis nigricans", entity: "/m/036b82" }, { name: "Ache", entity: "/m/0dl9sdd" }, { name: "Achilles tendon rupture", entity: "/m/06tbxm" }, { name: "Acholia", entity: "/m/0ryshn1" }, { name: "Acid erosion", entity: "/m/065tzg" }, { name: "Acidosis", entity: "/m/02gwty" }, { name: "Acne", entity: "/m/0jwqt" }, { name: "Acneiform eruption", entity: "/m/04jbylc" }, { name: "Acroosteolysis", entity: "/m/05ztxfr" }, { name: "Actinic keratosis", entity: "/m/04r3p5" }, { name: "Acute abdomen", entity: "/m/0d25nx" }, { name: "Acute bronchitis", entity: "/m/01s2xh" }, { name: "Acute chest pain", entity: "/m/0dl9t2r" }, { name: "Acute chest syndrome", entity: "/m/03m9zsx" }, { name: "Acute flaccid paralysis", entity: "/m/0dl9qc3" }, { name: "Acute kidney injury", entity: "/m/03545w" }, { name: "Acute Pain", entity: "/m/04yjjnf" }, { name: "Acute respiratory distress syndrome", entity: "/m/02fv1m" }, { name: "Acute seizures", entity: "/m/02kc15r" }, { name: "Acyanotic heart defect", entity: "/m/03k275" }, { name: "Adenoma sebaceum", entity: "/m/06wcg0z" }, { name: "Adenomyosis", entity: "/m/054xgp" }, { name: "Adermatoglyphia", entity: "/m/0h3sypv" }, { name: "Adie syndrome", entity: "/m/08g5r9" }, { name: "Adrenal crisis", entity: "/m/0wqdl_y" }, { name: "Adson's sign", entity: "/m/045hv5" }, { name: "Adynamia", entity: "/m/03clsld" }, { name: "Affective Symptoms", entity: "/m/07y4vwn" }, { name: "Afterimage", entity: "/m/02h98q" }, { name: "Ageusia", entity: "/m/05sfr2" }, { name: "Aggression", entity: "/m/0g0vg" }, { name: "Agitation", entity: "/m/064n__r" }, { name: "Agnosia", entity: "/m/016q5d" }, { name: "Agonal respiration", entity: "/m/07gylr" }, { name: "Agrammatism", entity: "/m/0crhgf" }, { name: "Agraphesthesia", entity: "/m/09gdzpf" }, { name: "Agraphia", entity: "/m/0jwvhgg" }, { name: "Air crescent sign", entity: "/m/0gkfrn" }, { name: "Air trapping", entity: "/m/0263nnq" }, { name: "Akathisia", entity: "/m/01dzyw" }, { name: "Albinism", entity: "/m/0122t" }, { name: "Albuminuria", entity: "/m/0g6q2" }, { name: "Alcohol flush reaction", entity: "/m/05nn1b" }, { name: "Alcoholism", entity: "/m/012jc" }, { name: "Alice in Wonderland syndrome", entity: "/m/019szr" }, { name: "Alkalosis", entity: "/m/02gwvb" }, { name: "Allergic bronchopulmonary aspergillosis", entity: "/m/0cvcl5" }, { name: "Allergic conjunctivitis", entity: "/m/04v6d0" }, { name: "Allergy", entity: "/m/0fd23" }, { name: "Allodynia", entity: "/m/096m74" }, { name: "Alogia", entity: "/m/01r718" }, { name: "Alpha 1-antitrypsin deficiency", entity: "/m/01t4q6" }, { name: "Altered level of consciousness", entity: "/m/04cqmvp" }, { name: "Altered mental status", entity: "/m/0dl9svn" }, { name: "Amaurosis", entity: "/m/05wt36" }, { name: "Amaurosis fugax", entity: "/m/036bqx" }, { name: "Ambiguous Genitalia (Female Genotype)", entity: "/m/0hsr95q" }, { name: "Ambiguous Genitalia (Female Genotype)", entity: "/m/0hsr4xr" }, { name: "Ambiguous Genitalia (Female Genotype)", entity: "/m/0hsr4gg" }, { name: "Ambiguous Genitalia (Female Genotype)", entity: "/m/0hsr1yr" }, { name: "Ambiguous Genitalia (Male Genotype)", entity: "/m/0hsr95t" }, { name: "Ambiguous Genitalia (Male Genotype)", entity: "/m/0hsr4xv" }, { name: "Ambiguous Genitalia (Male Genotype)", entity: "/m/0hsr4gk" }, { name: "Ambiguous Genitalia (Male Genotype)", entity: "/m/0hsr1yz" }, { name: "Amblyopia", entity: "/m/02s64_" }, { name: "Ameboma", entity: "/m/05c10rl" }, { name: "Amenorrhoea", entity: "/m/01j62y" }, { name: "Amnesia", entity: "/m/01j4hd" }, { name: "Amsler sign", entity: "/m/0g59dky" }, { name: "Amylophagia", entity: "/m/07_vwb" }, { name: "Anagen effluvium", entity: "/m/051vhjt" }, { name: "Anal fissure", entity: "/m/02gscl" }, { name: "Anal Stenosis", entity: "/m/05blyt6" }, { name: "Anal swelling", entity: "/m/0775pwb" }, { name: "Anaphylaxis", entity: "/m/0jtyb" }, { name: "Anasarca", entity: "/m/036br7" }, { name: "Anejaculation", entity: "/m/03bxghw" }, { name: "Anemia", entity: "/m/0lcdk" }, { name: "Anencephaly", entity: "/m/01hr6t" }, { name: "Anger", entity: "/m/0hymb" }, { name: "Angina pectoris", entity: "/m/0hg45" }, { name: "Anginal equivalent", entity: "/m/0gh8htd" }, { name: "Angioedema", entity: "/m/03tlvj" }, { name: "Angioid streaks", entity: "/m/02w1m45" }, { name: "Angor animi", entity: "/m/0dl9t9q" }, { name: "Angular cheilitis", entity: "/m/099686" }, { name: "Anhedonia", entity: "/m/01nvfh" }, { name: "Aniridia", entity: "/m/03gxt1" }, { name: "Anisocoria", entity: "/m/08mh71" }, { name: "Ankle flare", entity: "/m/0g9ww2h" }, { name: "Ankle pain", entity: "/m/0dl9skv" }, { name: "Annular skin lesion", entity: "/m/06_5zr9" }, { name: "Annuloaortic ectasia", entity: "/m/02q6sdc" }, { name: "Anogenital Pruritus", entity: "/m/0dl9s2l" }, { name: "Anorectal Pain", entity: "/m/0dl9t6x" }, { name: "Anorexia", entity: "/m/0brgy" }, { name: "Anosmia", entity: "/m/0m7pl" }, { name: "Anovulatory cycle", entity: "/m/0504pv" }, { name: "Antagonism", entity: "/m/027xhk_" }, { name: "Antepartum haemorrhage", entity: "/m/056x7r" }, { name: "Anterograde amnesia", entity: "/m/02m3p2" }, { name: "Anti-social behaviour", entity: "/m/02l4fy" }, { name: "Anuria", entity: "/m/04f74cm" }, { name: "Anxiety", entity: "/m/0k_9" }, { name: "Aortic unfolding", entity: "/m/0cz8y2h" }, { name: "Apathy", entity: "/m/01y4zk" }, { name: "Apex Beat Displaced", entity: "/m/0hsr95x" }, { name: "Apex Beat Displaced", entity: "/m/0hsr4y0" }, { name: "Apex Beat Displaced", entity: "/m/0hsr4gn" }, { name: "Apex Beat Displaced", entity: "/m/0hsr1z9" }, { name: "Apex Beat Sustained", entity: "/m/0hsr960" }, { name: "Apex Beat Sustained", entity: "/m/0hsr4y3" }, { name: "Apex Beat Sustained", entity: "/m/0hsr4gr" }, { name: "Apex Beat Sustained", entity: "/m/0hsr1zy" }, { name: "Apex Beat Tapping", entity: "/m/0hsr963" }, { name: "Apex Beat Tapping", entity: "/m/0hsr4y6" }, { name: "Apex Beat Tapping", entity: "/m/0hsr4gv" }, { name: "Apex Beat Tapping", entity: "/m/0hsr1_8" }, { name: "Aphakia", entity: "/m/0831jw" }, { name: "Aphasia", entity: "/m/0wnw" }, { name: "Aphonia", entity: "/m/025s02j" }, { name: "Aplasia cutis congenita", entity: "/m/05b1frk" }, { name: "Apnea", entity: "/m/01mr85" }, { name: "Appetite changes", entity: "/m/0dl9s_s" }, { name: "Apraxia", entity: "/m/0flz_" }, { name: "Aprosodia", entity: "/m/02rfs8c" }, { name: "Arachnodactyly", entity: "/m/041r6g" }, { name: "Arcus senilis", entity: "/m/06stpj" }, { name: "Argyll Robertson pupil", entity: "/m/036dkg" }, { name: "Arlt's line", entity: "/m/0tkkrnj" }, { name: "Arm pain", entity: "/m/0dl9slz" }, { name: "Arm Weakness", entity: "/m/0dl9tbv" }, { name: "Arterial insufficiency ulcer", entity: "/m/05q9btl" }, { name: "Arthritis", entity: "/m/0t1t" }, { name: "Arthritis mutilans", entity: "/m/0j_6ngk" }, { name: "Arthrogryposis", entity: "/m/0nrd_" }, { name: "Arthropathy", entity: "/m/07nsp9" }, { name: "Asboe-Hansen sign", entity: "/m/04q2tjp" }, { name: "Ascites", entity: "/m/01c24r" }, { name: "Asperger syndrome", entity: "/m/09cds" }, { name: "Asphyxia", entity: "/m/0p7w5" }, { name: "Astasia-abasia", entity: "/m/0bhftc" }, { name: "Astasis", entity: "/m/05pkly" }, { name: "Asterixis", entity: "/m/077dxt" }, { name: "Asthma", entity: "/m/0c78m" }, { name: "Astigmatism", entity: "/m/0chf1d" }, { name: "Asymmetrical Pulses", entity: "/m/0hsr966" }, { name: "Asymmetrical Pulses", entity: "/m/0hsr4yd" }, { name: "Asymmetrical Pulses", entity: "/m/0hsr4gy" }, { name: "Asymmetrical Pulses", entity: "/m/0hsr1_m" }, { name: "Asymmetry", entity: "/m/04nlqr7" }, { name: "Asymptomatic", entity: "/m/02vj01" }, { name: "Asynergy", entity: "/m/02z63fn" }, { name: "Ataxia", entity: "/m/0l95" }, { name: "Athetosis", entity: "/m/03hrw8" }, { name: "Atony", entity: "/m/08bp0k" }, { name: "Atrial enlargement", entity: "/m/07k9v9w" }, { name: "Atrial enlargement\t left   right or bilateral", entity: "/m/06b0xnm" }, { name: "Atrial fibrillation", entity: "/m/01wf75" }, { name: "Atrial tachycardia", entity: "/m/053y02n" }, { name: "Atrophic  plaques", entity: "/m/06_5zrj" }, { name: "Atrophy", entity: "/m/034y_l" }, { name: "Audible pop at time of injury", entity: "/m/0775flf" }, { name: "Auditory hallucination", entity: "/m/03hfxpg" }, { name: "Auditory verbal agnosia", entity: "/m/090dzh" }, { name: "Auenbrugger's sign", entity: "/m/05h56c6" }, { name: "Aura", entity: "/m/07ms80" }, { name: "Auspitz's sign", entity: "/m/03z76r" }, { name: "Autoimmune disease", entity: "/m/04dx3qn" }, { name: "Autoimmune hemolytic anemia", entity: "/m/0b1p89" }, { name: "Automatic behavior", entity: "/m/089ks8" }, { name: "Automatism", entity: "/m/04gvycb" }, { name: "AV nicking", entity: "/m/0405mqw" }, { name: "AV nodal reentrant tachycardia", entity: "/m/03rsgd" }, { name: "Avoidant personality disorder", entity: "/m/01_4_n" }, { name: "Avoiding people\t places or things in order to prevent germ contamination", entity: "/m/0p9b957" }, { name: "Avolition", entity: "/m/01sbgb" }, { name: "Axillary lymphadenopathy", entity: "/m/0bh6svk" }, { name: "Azotemia", entity: "/m/0dn4_" }, { name: "Azotorrhea", entity: "/m/02qdg9h" }, { name: "B symptoms", entity: "/m/08z394" }, { name: "Baby colic", entity: "/m/04zqq8" }, { name: "Back pain", entity: "/m/0142ky" }, { name: "Bacterial arthritis", entity: "/m/02nrsk" }, { name: "Bacterial vaginosis", entity: "/m/01glh" }, { name: "Bad breath", entity: "/m/025hzf" }, { name: "Balance disorder", entity: "/m/0180jb" }, { name: "Balanitis circinata", entity: "/m/02q5q8s" }, { name: "Ballance's sign", entity: "/m/03h32hp" }, { name: "Ballottement", entity: "/m/03whwhg" }, { name: "Bancroft's sign", entity: "/m/0bhbpzh" }, { name: "Barking cough", entity: "/m/078yyj8" }, { name: "Barrel chest", entity: "/m/04zxhhc" }, { name: "Bastianâ€“Bruns sign", entity: "/m/05p8fgm" }, { name: "Beau's lines", entity: "/m/069j_5" }, { name: "Beck's triad", entity: "/m/04rjcm" }, { name: "Becker's sign", entity: "/m/05pcqt7" }, { name: "Beevor's sign", entity: "/m/0bcyvy" }, { name: "BehÃ§et's disease", entity: "/m/025t67z" }, { name: "Behavioral addiction", entity: "/m/0bs79cp" }, { name: "Behavioral symptoms", entity: "/m/07y4v_n" }, { name: "Bell's palsy", entity: "/m/0dxdd" }, { name: "Bent finger", entity: "/m/07468xh" }, { name: "Bigeminy", entity: "/m/099t0f" }, { name: "Bigger mole diameter", entity: "/m/04nlqqw" }, { name: "Biliary colic", entity: "/m/026stnc" }, { name: "Biliary dyskinesia", entity: "/m/04cy_nk" }, { name: "Biliary sludge", entity: "/m/012ngbtr" }, { name: "Bing's sign", entity: "/m/05p4bk3" }, { name: "Binge eating", entity: "/m/01t96l" }, { name: "Biot's respiration", entity: "/m/05d44n" }, { name: "Birthmark", entity: "/m/01ljf2" }, { name: "Bitot's spots", entity: "/m/03z3vp" }, { name: "Black eye", entity: "/m/065wv1" }, { name: "Black pox", entity: "/m/05tcsy" }, { name: "Black tarry stool", entity: "/m/075bd16" }, { name: "Blackout", entity: "/m/02pnflk" }, { name: "Bladder pain", entity: "/m/0dl9sch" }, { name: "Bladder spasm", entity: "/m/02x4tcb" }, { name: "Blank stare", entity: "/m/06vzj_r" }, { name: "Bleeding", entity: "/m/012n6x" }, { name: "Bleeding diathesis", entity: "/m/037mv0" }, { name: "Bleeding from anus", entity: "/m/0dfmqkt" }, { name: "Bleeding from ear", entity: "/m/0dg4snt" }, { name: "Bleeding on probing", entity: "/m/02rtqbt" }, { name: "Blemishes", entity: "/m/07t7mz0" }, { name: "Blepharospasm", entity: "/m/08k14_" }, { name: "Blindness", entity: "/m/064kj9p" }, { name: "Blister", entity: "/m/01k1jq" }, { name: "Bloating", entity: "/m/011dzgb6" }, { name: "Blood blister", entity: "/m/05zy6c" }, { name: "Blood Dyscrasias", entity: "/m/03z97w_" }, { name: "Blood hammer", entity: "/m/0dlqb4" }, { name: "Blood in spit", entity: "/m/0dl9tjl" }, { name: "Blood in stool", entity: "/m/08cmfm" }, { name: "Bloody show", entity: "/m/05q5s6" }, { name: "Blue nails", entity: "/m/05b0h7r" }, { name: "Blue nevus", entity: "/m/02qgnm2" }, { name: "Blue sclerae", entity: "/m/0hsr1_z" }, { name: "Blueberry muffin baby", entity: "/m/05mxl64" }, { name: "Blumberg sign", entity: "/m/04mr6t" }, { name: "Blumer's shelf", entity: "/m/0j63q7l" }, { name: "Blurred vision", entity: "/m/03g_gxj" }, { name: "Blushing", entity: "/m/01jyxg" }, { name: "Boas' point", entity: "/m/05p5699" }, { name: "Boas' sign", entity: "/m/027clgs" }, { name: "Body odor", entity: "/m/037ywk" }, { name: "Body weight changes", entity: "/m/07y4w1l" }, { name: "Boil", entity: "/m/03xp5n" }, { name: "Bone deformities", entity: "/m/075yfz6" }, { name: "Bone fracture", entity: "/m/03fz1q" }, { name: "Bone pain", entity: "/m/06q_c0" }, { name: "Bone tumor", entity: "/m/01t125" }, { name: "Border irregularity", entity: "/m/04nlqr1" }, { name: "Boredom", entity: "/m/01j6mj" }, { name: "Borsari's sign", entity: "/m/0j7m3tj" }, { name: "Boston's sign", entity: "/m/08zy9f" }, { name: "Bouchard's nodes", entity: "/m/045hxd" }, { name: "Bounding pulse", entity: "/m/0cfb2d" }, { name: "Bow and arrow sign", entity: "/m/0fmphf" }, { name: "Bowel infarction", entity: "/m/02r0rdw" }, { name: "Bowel obstruction", entity: "/m/01vzqb" }, { name: "Brachycephaly", entity: "/m/01hrdy" }, { name: "Brachydactyly", entity: "/m/0mdcl" }, { name: "Bradycardia", entity: "/m/01r__" }, { name: "Bradypnea", entity: "/m/08hy81" }, { name: "Brain damage", entity: "/m/01sbk1" }, { name: "Brain death", entity: "/m/019m0c" }, { name: "Braverman's sign", entity: "/m/0j7lrg1" }, { name: "Braxton Hicks contractions", entity: "/m/03_81f" }, { name: "Breakthrough bleeding", entity: "/m/04fjyf" }, { name: "Breakthrough pain", entity: "/m/04gq09" }, { name: "Breast enlargement", entity: "/m/05pdgz2" }, { name: "Breast hematoma", entity: "/m/012bldgw" }, { name: "Breast hypertrophy", entity: "/m/025t7qd" }, { name: "Breast lump", entity: "/m/080fvq7" }, { name: "Breast pain", entity: "/m/06pp7p" }, { name: "Breastfeeding difficulties", entity: "/m/02z1qhl" }, { name: "Breathing problems", entity: "/m/04rjlwj" }, { name: "Broadbent inverted sign", entity: "/m/05p7spr" }, { name: "Broadbent sign", entity: "/m/05p78x6" }, { name: "Bronchial Breath Sounds", entity: "/m/0hsr201" }, { name: "Bronchiectasis", entity: "/m/01w_2w" }, { name: "Bronchitis", entity: "/m/047gmsk" }, { name: "Bronchoconstriction", entity: "/m/073m9q" }, { name: "Bronchophony", entity: "/m/027bt0g" }, { name: "Bronchorrhea", entity: "/m/027_4wl" }, { name: "Bronchospasm", entity: "/m/02_5n7" }, { name: "Brown induration", entity: "/m/07k9wg7" }, { name: "Brown-SÃ©quard syndrome", entity: "/m/03vwc5" }, { name: "BrudziÅ„ski cheek sign", entity: "/m/05p1mzz" }, { name: "BrudziÅ„ski symphyseal sign", entity: "/m/05p8zmv" }, { name: "BrudziÅ„ski's sign", entity: "/m/05p86vp" }, { name: "Bruise", entity: "/m/02zpsl" }, { name: "Bruit", entity: "/m/07qwnz" }, { name: "Bruns nystagmus", entity: "/m/0g9_2pv" }, { name: "Brushfield spots", entity: "/m/039412" }, { name: "Bruxism", entity: "/m/0149nm" }, { name: "Bubo", entity: "/m/02777pt" }, { name: "Bulbar palsy", entity: "/m/02qb7yy" }, { name: "Bulging flanks", entity: "/m/09l_s7" }, { name: "Bullying", entity: "/m/027vd9" }, { name: "Bunion", entity: "/m/01l2ky" }, { name: "Burning Chest Pain", entity: "/m/06lt6_m" }, { name: "Burning mouth syndrome", entity: "/m/03_3c6" }, { name: "Bursitis", entity: "/m/034z18" }, { name: "Burton line", entity: "/m/05pcm9t" }, { name: "Cachexia", entity: "/m/01wxhm" }, { name: "CafÃ© au lait spot", entity: "/m/04xkg4" }, { name: "Calcaneal spur", entity: "/m/025t1sl" }, { name: "Calcinosis", entity: "/m/042yl7" }, { name: "Calcinosis cutis", entity: "/m/042m3q" }, { name: "Calf pain", entity: "/m/0hsr204" }, { name: "Callus", entity: "/m/01l2l9" }, { name: "Camptodactyly", entity: "/m/02qxxsk" }, { name: "Cancer pain", entity: "/m/0h3vj_3" }, { name: "Cancer-related fatigue", entity: "/m/0dllzqv" }, { name: "Candidiasis", entity: "/m/020gv" }, { name: "Canker sore", entity: "/m/05frfm" }, { name: "Cannon A waves", entity: "/m/05mrndk" }, { name: "Caput medusae", entity: "/m/049wbg" }, { name: "Cardarelli's sign", entity: "/m/0c2p1c" }, { name: "Cardiac arrest", entity: "/m/0gg4h" }, { name: "Cardiac arrhythmia", entity: "/m/01pf6" }, { name: "Cardiac asthma", entity: "/m/08fnwn" }, { name: "Cardiomegaly", entity: "/m/08_51g" }, { name: "Carnett's sign", entity: "/m/04g1lmg" }, { name: "Carotenosis", entity: "/m/0cdrvd" }, { name: "Carotid bruit", entity: "/m/0bk8gk" }, { name: "Carpal tunnel syndrome", entity: "/m/0fl_v" }, { name: "Carvallo's sign", entity: "/m/05p44wb" }, { name: "Casal collar", entity: "/m/05p45xp" }, { name: "Castell's sign", entity: "/m/0c9w3f" }, { name: "Cataplexy", entity: "/m/07f_8c" }, { name: "Cataract", entity: "/m/0m7h6" }, { name: "Catatonia", entity: "/m/01lxx" }, { name: "Cauda equina syndrome", entity: "/m/04yb5z" }, { name: "Central cord syndrome", entity: "/m/02qbn93" }, { name: "Central facial palsy", entity: "/m/0276115" }, { name: "Central pontine myelinolysis", entity: "/m/0268v" }, { name: "cerebella tumor", entity: "/m/02gxv5s" }, { name: "Cerebellar ataxia", entity: "/m/02vkcrn" }, { name: "Cerebellar stroke syndrome", entity: "/m/09gq6ht" }, { name: "Cerebral edema", entity: "/m/0219bz" }, { name: "Cerebral polyopia", entity: "/m/011q1xpz" }, { name: "Cerebritis", entity: "/m/03d4x24" }, { name: "Cerebrospinal fluid leak", entity: "/m/05f344r" }, { name: "Cerebrospinal fluid otorrhea", entity: "/m/09rqdxw" }, { name: "Cerebrospinal fluid rhinorrhea", entity: "/m/09rq68v" }, { name: "Cervical cancer", entity: "/m/0d_bk" }, { name: "Cervical lymphadenopathy", entity: "/m/0bh9rhf" }, { name: "Cervical motion tenderness", entity: "/m/02vlfrb" }, { name: "Cervicitis", entity: "/m/020v3l" }, { name: "Chadwick's sign", entity: "/m/08h6km" }, { name: "Chagoma", entity: "/m/0jkys2b" }, { name: "Chalazion", entity: "/m/03gf8g" }, { name: "Chalkstick fracture", entity: "/m/02q2xk1" }, { name: "Chancre", entity: "/m/01ny_v" }, { name: "Change in bowel habits", entity: "/m/04mvdfs" }, { name: "Change in sexual interest", entity: "/m/0784pwp" }, { name: "Change of color in retina", entity: "/m/06_5xbz" }, { name: "Charcotâ€“Leyden crystals", entity: "/m/08ydrl" }, { name: "Cheilitis", entity: "/m/0gj51x" }, { name: "Chemosis", entity: "/m/04jr5f" }, { name: "Chemotherapy-induced acral erythema", entity: "/m/02qkht2" }, { name: "Cherry-red spot", entity: "/m/065yks4" }, { name: "Chest Hyperinflation", entity: "/m/0hsr96l" }, { name: "Chest Hyperinflation", entity: "/m/0hsr4zg" }, { name: "Chest Hyperinflation", entity: "/m/0hsr4h9" }, { name: "Chest Hyperinflation", entity: "/m/0hsr207" }, { name: "Chest pain", entity: "/m/02np4v" }, { name: "Chest Tightness", entity: "/m/06gx48m" }, { name: "Cheyneâ€“Stokes respiration", entity: "/m/036k30" }, { name: "Chills", entity: "/m/02mdc7" }, { name: "Choking", entity: "/m/0168pw" }, { name: "Cholestasis", entity: "/m/07t2pp" }, { name: "Choluria", entity: "/m/0bwjd87" }, { name: "Chordee", entity: "/m/021xcm" }, { name: "Chorea", entity: "/m/03d70n" }, { name: "Choreoathetosis", entity: "/m/04bltj" }, { name: "Chorioretinitis", entity: "/m/01dl8m" }, { name: "Choroidal neovascularization", entity: "/m/03d0r78" }, { name: "Chromatopsia", entity: "/m/0hsr96p" }, { name: "Chromatopsia", entity: "/m/0hsr4zn" }, { name: "Chromatopsia", entity: "/m/0hsr4hd" }, { name: "Chromatopsia", entity: "/m/0hsr20b" }, { name: "Chromhidrosis", entity: "/m/09vnrh" }, { name: "Chronic constipation", entity: "/m/0dfmqm9" }, { name: "Chronic cough", entity: "/m/06h43j3" }, { name: "Chronic Diarrhea", entity: "/m/02kd3j8" }, { name: "Chronic diarrhea of infancy", entity: "/m/0bh8c4z" }, { name: "Chronic headache", entity: "/m/0d83xgv" }, { name: "Chronic pain", entity: "/m/012clh" }, { name: "Chronic progressive external ophthalmoplegia", entity: "/m/02z2637" }, { name: "Chronic prostatitis/chronic pelvic pain syndrome", entity: "/m/043jxv5" }, { name: "Chronic wound", entity: "/m/08ssqs" }, { name: "Chvostek sign", entity: "/m/0407j6" }, { name: "Chyluria", entity: "/m/02ql75c" }, { name: "Circumstantial speech", entity: "/m/0gh89fc" }, { name: "Cirrhosis", entity: "/m/097ns" }, { name: "Clanging", entity: "/m/0cg61" }, { name: "Claudication", entity: "/m/05c1gt" }, { name: "Claybrook sign", entity: "/m/05q6509" }, { name: "Cleft lip and cleft palate", entity: "/m/07y4w6s" }, { name: "Clinodactyly", entity: "/m/02w3jkd" }, { name: "Clitoromegaly", entity: "/m/04jpnx" }, { name: "Clonus", entity: "/m/02zdnj" }, { name: "Clostridium difficile infection", entity: "/m/02cxr0" }, { name: "Clouding of consciousness", entity: "/m/02656gy" }, { name: "Cloudy urine", entity: "/m/075v3bx" }, { name: "COâ‚‚ retention", entity: "/m/04mpx0" }, { name: "Coagulative necrosis", entity: "/m/03qc8xf" }, { name: "Coagulopathy", entity: "/m/065b00" }, { name: "Coarse Hair", entity: "/m/0hsr4hj" }, { name: "Coarse Hair", entity: "/m/0hsr20f" }, { name: "Coccydynia", entity: "/m/031c9y" }, { name: "Coffee ground vomiting", entity: "/m/02n2zp" }, { name: "Cognitive deficit", entity: "/m/02py0vt" }, { name: "Cold sensitivity", entity: "/m/03c607t" }, { name: "Cold sweat", entity: "/m/0dfmqlr" }, { name: "Colitis", entity: "/m/043hy3" }, { name: "Collapse", entity: "/m/026gdg4" }, { name: "Collateral circulation", entity: "/m/03nmgjv" }, { name: "Collective narcissism", entity: "/m/0glrsmb" }, { name: "Collier's sign", entity: "/m/0kg1nvy" }, { name: "Collodion baby", entity: "/m/04g0zz1" }, { name: "Color blindness", entity: "/m/022xh" }, { name: "Coma", entity: "/m/01qw1" }, { name: "Comby sign", entity: "/m/05q4vfx" }, { name: "Comedo", entity: "/m/02ry9q" }, { name: "Common cold", entity: "/m/0n073" }, { name: "Communication deviance", entity: "/m/011smvs0" }, { name: "Compartment syndrome", entity: "/m/01j0hs" }, { name: "Compensatory hyperhidrosis", entity: "/m/0cpdgx" }, { name: "Compulsive behavior", entity: "/m/0281lfw" }, { name: "Compulsive hoarding", entity: "/m/0240_y" }, { name: "Compulsive skin-touching", entity: "/m/06wfzt0" }, { name: "Concealed conduction", entity: "/m/02v_hky" }, { name: "Conductive hearing loss", entity: "/m/04fmtx" }, { name: "Condylomata lata", entity: "/m/0czbwwx" }, { name: "Confabulation", entity: "/m/03h1ry6" }, { name: "Confabulation", entity: "/m/0371d4" }, { name: "Confusion", entity: "/m/06kqbx" }, { name: "Congenital clasped thumb", entity: "/m/0h976q1" }, { name: "Congenital heart defect", entity: "/m/03k22s" }, { name: "Congenital lip pit", entity: "/m/0b6hxcj" }, { name: "Conjunctival suffusion", entity: "/m/0dljk3n" }, { name: "Conjunctivitis", entity: "/m/0c36_" }, { name: "Constant craving for alcohol", entity: "/m/07b56xr" }, { name: "Constant craving for drugs or chemicals", entity: "/m/07b51fh" }, { name: "Constipation", entity: "/m/016kf9" }, { name: "Constructional apraxia", entity: "/m/0gj9_k1" }, { name: "Contracture", entity: "/m/04f49cb" }, { name: "Contusion of lower leg", entity: "/m/0dl9s88" }, { name: "Convulsion", entity: "/m/04lcpr5" }, { name: "Cooper's sign", entity: "/m/04gpkvs" }, { name: "Coprolalia", entity: "/m/02gp9x" }, { name: "Copropraxia", entity: "/m/0bcsx9" }, { name: "Corectopia", entity: "/m/0260nq7" }, { name: "Cornea verticillata", entity: "/m/0zdt17d" }, { name: "Corneal abrasion", entity: "/m/07ldcz" }, { name: "Corneal Anaesthesia", entity: "/m/0hsr96w" }, { name: "Corneal Anaesthesia", entity: "/m/0hsr51g" }, { name: "Corneal Anaesthesia", entity: "/m/0hsr4hm" }, { name: "Corneal Anaesthesia", entity: "/m/0hsr20s" }, { name: "Corneal Opacity", entity: "/m/07y4w8_" }, { name: "Corneal Thinning", entity: "/m/0hsr96z" }, { name: "Corneal Thinning", entity: "/m/0hsr52s" }, { name: "Corneal Thinning", entity: "/m/0hsr4hq" }, { name: "Corneal Thinning", entity: "/m/0hsr20w" }, { name: "Cornell's sign", entity: "/m/05szbzm" }, { name: "Corona phlebectatica", entity: "/m/0rfdr0v" }, { name: "Cortical blindness", entity: "/m/089r8q" }, { name: "Coryza", entity: "/m/0c532h" }, { name: "Costovertebral angle tenderness", entity: "/m/09d1md" }, { name: "Cotton wool spots", entity: "/m/02qd609" }, { name: "Cough", entity: "/m/01b_21" }, { name: "Coxa valga", entity: "/m/02qvqc7" }, { name: "Coxa vara", entity: "/m/02lmr4" }, { name: "Cracked Skin", entity: "/m/06_hvl2" }, { name: "Crackles", entity: "/m/023rn8" }, { name: "Cramp", entity: "/m/024_yy" }, { name: "Cranial nerve disease", entity: "/m/04f7377" }, { name: "Cranioschisis", entity: "/m/0b6l7_3" }, { name: "Craving", entity: "/m/064qvry" }, { name: "Cremasteric reflex", entity: "/m/02ssz2" }, { name: "Crenated tongue", entity: "/m/0x28640" }, { name: "Crepitus", entity: "/m/05bws4" }, { name: "Crescent sign", entity: "/m/028bw97" }, { name: "Crichton-Browne sign", entity: "/m/05q91s8" }, { name: "Crowding", entity: "/m/0j29g86" }, { name: "Crowding of teeth", entity: "/m/09rqhzl" }, { name: "Crowe sign", entity: "/m/090wkz" }, { name: "Crying", entity: "/m/0463cq4" }, { name: "Crying infant", entity: "/m/0dl9t7d" }, { name: "Cryoglobulinemic purpura", entity: "/m/05p118t" }, { name: "Cryptomenorrhea", entity: "/m/04zjj3" }, { name: "Cryptorchidism", entity: "/m/025nm6" }, { name: "Crystalluria", entity: "/m/08k_24" }, { name: "Cubital Tunnel Syndrome", entity: "/m/07y4yl5" }, { name: "Cubitus valgus", entity: "/m/09gr4q" }, { name: "Cullen's sign", entity: "/m/04rs9k" }, { name: "Cupola sign", entity: "/m/013f7djn" }, { name: "Cushing reflex", entity: "/m/04bj54" }, { name: "Cushing's syndrome", entity: "/m/0mzm2" }, { name: "Cutaneous candidiasis", entity: "/m/011nkgqd" }, { name: "Cutaneous condition", entity: "/m/08cqsh" }, { name: "Cutis laxa", entity: "/m/0c_0xv" }, { name: "Cutis marmorata", entity: "/m/0h3xwcs" }, { name: "Cyanosis", entity: "/m/021fq9" }, { name: "Cycloplegia", entity: "/m/028c4n" }, { name: "Cyst", entity: "/m/019rnl" }, { name: "DÃ©viation conjuguÃ©e", entity: "/m/0bs68yq" }, { name: "Dacryoadenitis", entity: "/m/046j0s" }, { name: "Dactylitis", entity: "/m/03_3lh" }, { name: "Dahl's sign", entity: "/m/05q969m" }, { name: "Dalrymple's sign", entity: "/m/0fltf4" }, { name: "Dance's sign", entity: "/m/09z36s" }, { name: "Dandruff", entity: "/m/022y19" }, { name: "Darier's sign", entity: "/m/08yzsq" }, { name: "Dark urine", entity: "/m/05blz8d" }, { name: "Daytime drowsiness", entity: "/m/0dl9qc8" }, { name: "De Musset's sign", entity: "/m/09gl4kp" }, { name: "Death rattle", entity: "/m/0660m0" }, { name: "Decoy cells", entity: "/m/03c3c74" }, { name: "Decreased breast size", entity: "/m/06_mn93" }, { name: "Decreased ecg voltages\t damped complexes   low amplitude", entity: "/m/06b0xnd" }, { name: "Decreased HDL cholesterol", entity: "/m/0786gjh" }, { name: "Decreased level of consciousness", entity: "/m/064bl1t" }, { name: "Decreased Libido", entity: "/m/0dl9s30" }, { name: "Decussation", entity: "/m/0266tn8" }, { name: "Deep Sleep", entity: "/m/0gtn6rp" }, { name: "Deep sulcus sign", entity: "/m/0f2l74" }, { name: "Deep vein thrombosis", entity: "/m/02r3jk" }, { name: "Deepening of voice", entity: "/m/06_mncd" }, { name: "Defensive vomiting", entity: "/m/08phwv" }, { name: "Deformity", entity: "/m/0383j_" }, { name: "Dehydration", entity: "/m/014961" }, { name: "Delayed milestone", entity: "/m/08x7wr" }, { name: "Delayed onset muscle soreness", entity: "/m/03dcyh" }, { name: "Delayed onset of menopause", entity: "/m/04mv7tw" }, { name: "Delayed puberty", entity: "/m/02_nxt" }, { name: "Delayed reading ability", entity: "/m/06x607x" }, { name: "Delayed Tooth Eruption", entity: "/m/0hsr20z" }, { name: "Delirium", entity: "/m/014qfd" }, { name: "Delirium tremens", entity: "/m/0fpnjr" }, { name: "Delusion", entity: "/m/0xnpq" }, { name: "Delusional disorder", entity: "/m/01l7xz" }, { name: "Delusional intuition", entity: "/m/0h_9b67" }, { name: "Delusional misidentification syndrome", entity: "/m/021246" }, { name: "Delusions of reference", entity: "/m/019fy6" }, { name: "Dementia", entity: "/m/09klv" }, { name: "Dense artery sign", entity: "/m/05pc1dr" }, { name: "Dental emergency", entity: "/m/0bg74m" }, { name: "Dental plaque", entity: "/m/073t8x" }, { name: "Dental swelling", entity: "/m/0dl9shl" }, { name: "Dentin hypersensitivity", entity: "/m/0d7gj3" }, { name: "Dentin Sensitivity", entity: "/m/07y4wbm" }, { name: "Dependent personality disorder", entity: "/m/01sydv" }, { name: "Depersonalization", entity: "/m/01zn1_" }, { name: "Depigmentation", entity: "/m/027cv8v" }, { name: "Depression", entity: "/m/03f_cb" }, { name: "Derealization", entity: "/m/02wv6r8" }, { name: "Dermatitis", entity: "/m/06x09g" }, { name: "Dermatographic urticaria", entity: "/m/06djbj" }, { name: "Desmoplasia", entity: "/m/09gn45k" }, { name: "Desquamation", entity: "/m/05pbx5" }, { name: "Destot's sign", entity: "/m/05q4mnc" }, { name: "Developmental disability", entity: "/m/06xd3t" }, { name: "Diabetes insipidus", entity: "/m/0c5s4" }, { name: "Diabetes mellitus", entity: "/m/0c58k" }, { name: "Diabetic dermopathy", entity: "/m/064r6nt" }, { name: "Diaphoresis", entity: "/m/01q1s3" }, { name: "Diaphragmatic Paradox", entity: "/m/04y94ty" }, { name: "Diarrhea", entity: "/m/0f3kl" }, { name: "Diastolic heart failure", entity: "/m/02pv6ym" }, { name: "Diastolic heart murmur", entity: "/m/05b2cbl" }, { name: "Diastrophic dysplasia", entity: "/m/055lbw" }, { name: "Diathesis", entity: "/m/0sghsdb" }, { name: "Dieting", entity: "/m/02b_m" }, { name: "Difficulty distinguishing between blue and green", entity: "/m/0727q29" }, { name: "Difficulty distinguishing between red and green", entity: "/m/0727q2p" }, { name: "Difficulty distinguishing between yellow and blue", entity: "/m/0727q2h" }, { name: "Difficulty falling asleep", entity: "/m/0dl9sx_" }, { name: "Difficulty focusing", entity: "/m/0dl9sw9" }, { name: "Difficulty speaking", entity: "/m/0dl9tkg" }, { name: "Digestive Signs and Symptoms", entity: "/m/07y4xy5" }, { name: "Dimple sign", entity: "/m/0j7mdyv" }, { name: "Diplopia", entity: "/m/03x17h" }, { name: "Disappointment", entity: "/m/01lsjf" }, { name: "Discoloration of the legs", entity: "/m/075v2rl" }, { name: "Disequilibrium", entity: "/m/076vs5y" }, { name: "Disinhibition", entity: "/m/06mfqk" }, { name: "Disorganized behavior", entity: "/m/0dl9tl2" }, { name: "Disorientation", entity: "/m/0dl9scp" }, { name: "Displaced Trachea", entity: "/m/0hsr974" }, { name: "Displaced Trachea", entity: "/m/0hsr4j5" }, { name: "Displaced Trachea", entity: "/m/0hsr211" }, { name: "Disproportionate short stature", entity: "/m/06vxtw3" }, { name: "Disregard for right and wrong", entity: "/m/06wfmp_" }, { name: "Disseminated intravascular coagulation", entity: "/m/01jjrv" }, { name: "Dissociation", entity: "/m/02l_0n" }, { name: "Dissociative disorder", entity: "/m/07bc25" }, { name: "Distal intestinal obstruction syndrome", entity: "/m/0d4g_5" }, { name: "Distal Muscle Weakness", entity: "/m/0hsr977" }, { name: "Distal Muscle Weakness", entity: "/m/0hsr4kp" }, { name: "Distal Muscle Weakness", entity: "/m/0hsr214" }, { name: "Distal muscular dystrophy", entity: "/m/0fm4gj" }, { name: "Distorted nails", entity: "/m/07h75tl" }, { name: "Distorted vision", entity: "/m/09rx552" }, { name: "Distress", entity: "/m/03cyjcw" }, { name: "Diurnal enuresis", entity: "/m/0gnl_f" }, { name: "Dizziness", entity: "/m/033mg5" }, { name: "Doi's sign", entity: "/m/05q6cvf" }, { name: "Drooling", entity: "/m/019bfk" }, { name: "Drop attack", entity: "/m/0crl43" }, { name: "Drug-induced hyperthermia", entity: "/m/026y632" }, { name: "Drug-induced purpura", entity: "/m/05q854j" }, { name: "Dry cough", entity: "/m/027fpnw" }, { name: "Dry eye", entity: "/m/05c7tsn" }, { name: "Dry eye syndrome", entity: "/m/03ckn0" }, { name: "Dry hair", entity: "/m/0dl9svf" }, { name: "Dry scalp", entity: "/m/0dl9tch" }, { name: "Dry throat", entity: "/m/0dl9sgp" }, { name: "Dryness", entity: "/m/0g9_00t" }, { name: "Du Bois sign", entity: "/m/0j277yc" }, { name: "Dunphy sign", entity: "/m/05mt1m8" }, { name: "Dupuytren's contracture", entity: "/m/036l18" }, { name: "Duroziez's sign", entity: "/m/076t2pw" }, { name: "Dwarfism", entity: "/m/010vmq" }, { name: "Dysarthria", entity: "/m/03ygz2" }, { name: "Dysautonomia", entity: "/m/02510j" }, { name: "Dysdiadochokinesia", entity: "/m/07yl6y" }, { name: "Dysentery", entity: "/m/0h3bn" }, { name: "Dysequilibrium", entity: "/m/0dl9swj" }, { name: "Dysesthesia", entity: "/m/0264gx3" }, { name: "Dysfunctional uterine bleeding", entity: "/m/04cslz" }, { name: "Dysgeusia", entity: "/m/01d3gn" }, { name: "Dyskinesia", entity: "/m/03_xjz" }, { name: "Dysmenorrhea", entity: "/m/0255t_" }, { name: "Dysosmia", entity: "/m/04czcv_" }, { name: "Dyspareunia", entity: "/m/01qqq7" }, { name: "Dysphagia", entity: "/m/01bztl" }, { name: "Dysphasia", entity: "/m/02vw4q" }, { name: "Dysphonia", entity: "/m/07_7w6" }, { name: "Dysphoria", entity: "/m/055f85" }, { name: "Dysplastic nail", entity: "/m/0bh6_0r" }, { name: "Dystonia", entity: "/m/02_x8m" }, { name: "Dysuria", entity: "/m/03wblc" }, { name: "Ear pain", entity: "/m/05vywy" }, { name: "Ear pruritus", entity: "/m/0dl9tdr" }, { name: "Easy bruising", entity: "/m/0dl9szn" }, { name: "Ecchymosis", entity: "/m/05b6rk9" }, { name: "Eccrine mucinosis", entity: "/m/0bbz5ry" }, { name: "Echolalia", entity: "/m/03y0cn" }, { name: "Echopraxia", entity: "/m/09b6_7" }, { name: "Eclabium", entity: "/m/04_03f6" }, { name: "Edema", entity: "/m/0j80c" }, { name: "Elbow pain", entity: "/m/0dl9sl0" }, { name: "Electromagnetic hypersensitivity", entity: "/m/0bqhl7" }, { name: "Elevated alkaline phosphatase", entity: "/m/063ykc9" }, { name: "Elfin facies", entity: "/m/04crjg4" }, { name: "Emaciation", entity: "/m/070kyz" }, { name: "Embryocardia", entity: "/m/0rytkmx" }, { name: "Emotional detachment", entity: "/m/092b1g" }, { name: "Emotional distress", entity: "/m/06x7t9c" }, { name: "Emotional dysregulation", entity: "/m/0b3n_k" }, { name: "Emotional security", entity: "/m/01hz11" }, { name: "Enanthem", entity: "/m/04y8g5q" }, { name: "Encephalitis", entity: "/m/09c_t" }, { name: "Encephalopathy", entity: "/m/022tc0" }, { name: "Encopresis", entity: "/m/0298jv" }, { name: "Endometrial hyperplasia", entity: "/m/02rc7qj" }, { name: "Enlarged uterus", entity: "/m/075k1p8" }, { name: "Enophthalmia", entity: "/m/08tgvr" }, { name: "Enophthalmos", entity: "/m/0cwyf3" }, { name: "Enterocolitis", entity: "/m/07y4wgq" }, { name: "Enthesitis", entity: "/m/0gs1mr" }, { name: "Enthesopathy", entity: "/m/08bvg8" }, { name: "Entropion and trichiasis of eyelid", entity: "/m/07vv08_" }, { name: "Enuresis", entity: "/m/03gq2nq" }, { name: "Eosinophilia", entity: "/m/01jmy5" }, { name: "Epicanthic fold", entity: "/m/014x2z" }, { name: "Epidermoid cyst", entity: "/m/04mw9m" }, { name: "Epigastric discomfort", entity: "/m/0dl9tjd" }, { name: "Epigastric pain", entity: "/m/0dl9sc2" }, { name: "Epilepsy", entity: "/m/02vrr" }, { name: "Epileptic seizure", entity: "/m/06rhk" }, { name: "Epiphora", entity: "/m/02r3mv3" }, { name: "Erectile dysfunction", entity: "/m/03tkm" }, { name: "Eructation", entity: "/m/03q5_w" }, { name: "Eruptive Cutaneous Xanthomata", entity: "/m/0hsr97c" }, { name: "Eruptive Cutaneous Xanthomata", entity: "/m/0hsr4n3" }, { name: "Eruptive Cutaneous Xanthomata", entity: "/m/0hsr217" }, { name: "Erythema", entity: "/m/02mcv2" }, { name: "Erythema ab igne", entity: "/m/08wqbz" }, { name: "Erythema chronicum migrans", entity: "/m/0bzv6k" }, { name: "Erythema gyratum repens", entity: "/m/054gfnh" }, { name: "Erythema marginatum", entity: "/m/04nb5w" }, { name: "Erythema multiforme", entity: "/m/03s352" }, { name: "Erythema nodosum", entity: "/m/08fm2f" }, { name: "Erythema toxicum neonatorum", entity: "/m/09f0sx" }, { name: "Erythrocyanosis crurum", entity: "/m/05s_3gg" }, { name: "Erythroleukoplakia", entity: "/m/04r4mtm" }, { name: "Erythromelalgia", entity: "/m/03hcpy" }, { name: "Erythroplakia", entity: "/m/04trfb" }, { name: "Eschar", entity: "/m/03_m2p" }, { name: "Esophageal dysphagia", entity: "/m/047gmhy" }, { name: "Esophageal varices", entity: "/m/0340vp" }, { name: "Esophagitis", entity: "/m/01b_b2" }, { name: "Esotropia", entity: "/m/0184pc" }, { name: "Eunuchism", entity: "/m/07y4yqp" }, { name: "Euphoria", entity: "/m/02rj8by" }, { name: "Evanescent", entity: "/m/05mxfh7" }, { name: "Ewart's sign", entity: "/m/08zgjt" }, { name: "Exanthem", entity: "/m/07bblt" }, { name: "Excessive crying", entity: "/m/0dfmqjh" }, { name: "Excessive Crying of Infant", entity: "/m/0dfmqmk" }, { name: "Excessive daytime sleepiness", entity: "/m/02y_82q" }, { name: "Excessive grooming", entity: "/m/06wfzsb" }, { name: "Excessive lordotic curvature", entity: "/m/0703r9c" }, { name: "Excitement", entity: "/m/0bdrmgq" }, { name: "Excruciating headache", entity: "/m/0d83xlw" }, { name: "Exercise intolerance", entity: "/m/05k5sc" }, { name: "Exercise-induced nausea", entity: "/m/011b6z0v" }, { name: "Exertional dyspnea", entity: "/m/0dl9sbc" }, { name: "Exophthalmic goiter", entity: "/m/0267ccm" }, { name: "Exophthalmos", entity: "/m/05mjhy" }, { name: "Exotropia", entity: "/m/099x_8" }, { name: "Extrapyramidal symptoms", entity: "/m/09gkmws" }, { name: "Extreme Shyness", entity: "/m/06wfvnp" }, { name: "Extreme Weight Loss", entity: "/m/06wfm4d" }, { name: "Exudate", entity: "/m/02yj5k" }, { name: "Eye discomfort", entity: "/m/0dl9qcf" }, { name: "Eye Infections", entity: "/m/0dl762y" }, { name: "Eye inflammation", entity: "/m/06zxb3j" }, { name: "Eye irritation", entity: "/m/0dl9sgx" }, { name: "Eye Manifestations", entity: "/m/07y4wkh" }, { name: "Eye pain", entity: "/m/05fs77x" }, { name: "Eye sore", entity: "/m/0dl9t6m" }, { name: "Eye strain", entity: "/m/07v7rh" }, { name: "Eyelid pruritus", entity: "/m/072b0hy" }, { name: "Eyelid tenderness", entity: "/m/072b9q3" }, { name: "Fabella sign", entity: "/m/02893yq" }, { name: "Facial grimace", entity: "/m/06w28x3" }, { name: "Facial Hair Growth", entity: "/m/0dl9qcl" }, { name: "Facial nerve paralysis", entity: "/m/04mpk9" }, { name: "Facial pain", entity: "/m/06trjsl" }, { name: "Facial paralysis", entity: "/m/07y4wlx" }, { name: "Facial paresis", entity: "/m/09z409" }, { name: "Facial rash", entity: "/m/0dl9smd" }, { name: "Facial redness", entity: "/m/07t7mr3" }, { name: "Facial Spasms", entity: "/m/0dl9sw2" }, { name: "Facial swelling", entity: "/m/06_jyjk" }, { name: "Facies Abnormality", entity: "/m/0hsr97g" }, { name: "Facies acromegalica", entity: "/m/012hd8rk" }, { name: "Factor V Deficiency", entity: "/m/07y4wm1" }, { name: "Faget sign", entity: "/m/02qm5h6" }, { name: "Failure to pass meconium", entity: "/m/0771cr0" }, { name: "Failure to thrive", entity: "/m/05xf16" }, { name: "Falling", entity: "/m/04f32c6" }, { name: "Familial thoracic aortic aneurysm", entity: "/m/03wzc0" }, { name: "Far-sightedness", entity: "/m/0248jp" }, { name: "Fasciculation", entity: "/m/062phb" }, { name: "Fasting hyperglycemia", entity: "/m/0786gjq" }, { name: "Fat pad sign", entity: "/m/0285p8k" }, { name: "Fatigue", entity: "/m/01j6t0" }, { name: "Fatigue syndrome", entity: "/m/0dfmqjz" }, { name: "Fatty liver", entity: "/m/03s7fs" }, { name: "Fear", entity: "/m/02xrl" }, { name: "Fear of Commitment", entity: "/m/026r7rc" }, { name: "Fear of falling", entity: "/m/0278ng9" }, { name: "Fear of the dark", entity: "/m/03gq6y_" }, { name: "Febrile neutrophilic dermatosis", entity: "/m/09jw9n" }, { name: "Febrile seizure", entity: "/m/013q86" }, { name: "Fecal incontinence", entity: "/m/018h28" }, { name: "Fecal urgency", entity: "/m/0dl9qcx" }, { name: "Feeding difficulties", entity: "/m/05v24jd" }, { name: "Feeling cold", entity: "/m/0dl9sg9" }, { name: "Feeling of fullness in the ear", entity: "/m/075v3x9" }, { name: "Feeling tense", entity: "/m/0dl9sg2" }, { name: "Feeling tired", entity: "/m/0dl9tf6" }, { name: "Female infertility", entity: "/m/03bx9gs" }, { name: "Fetal distress", entity: "/m/02sj16" }, { name: "Fetal Macrosomia", entity: "/m/07y4wn8" }, { name: "Fetor", entity: "/m/051ztp2" }, { name: "Fetor hepaticus", entity: "/m/068940" }, { name: "Fever", entity: "/m/0cjf0" }, { name: "Fibrillation", entity: "/m/0118lbwm" }, { name: "Fibromyalgia", entity: "/m/01v3ks" }, { name: "Fibrosis", entity: "/m/03nq4p" }, { name: "Fidgeting", entity: "/m/04y6tl1" }, { name: "Finger nodule", entity: "/m/07468x9" }, { name: "Finger numbness", entity: "/m/0dl9t7l" }, { name: "Finger pain", entity: "/m/0dl9smm" }, { name: "Fingers Paresthesia", entity: "/m/0dl9smv" }, { name: "First Trimester Bleed Per Vaginam", entity: "/m/0hsr97k" }, { name: "First Trimester Bleed Per Vaginam", entity: "/m/0hsr21f" }, { name: "Fissures on fingers or toes", entity: "/m/06_hrr1" }, { name: "Fixed Split of Second Heart Sound", entity: "/m/0hsr97n" }, { name: "Fixed Split of Second Heart Sound", entity: "/m/0hsr21j" }, { name: "Flaccid paralysis", entity: "/m/02qkp38" }, { name: "Flank pain", entity: "/m/07458lj" }, { name: "Flashback", entity: "/m/06jb7p" }, { name: "Flatulence", entity: "/m/06vg9d" }, { name: "Flatulence", entity: "/m/02_pz" }, { name: "Fleischer ring", entity: "/m/08vvjv" }, { name: "Floater", entity: "/m/018j1l" }, { name: "Flu-like syndrome", entity: "/m/05fb6kq" }, { name: "Flushing", entity: "/m/028n_3" }, { name: "Focal neurologic signs", entity: "/m/0286bt0" }, { name: "Folate deficiency", entity: "/m/0dt6ml" }, { name: "Folie Ã  deux", entity: "/m/03281" }, { name: "Follicular hyperkeratosis", entity: "/m/076yhwq" }, { name: "Food addiction", entity: "/m/04sws8" }, { name: "Food aversion", entity: "/m/0dl9tgj" }, { name: "Food craving", entity: "/m/0b76y0" }, { name: "Foot drop", entity: "/m/0bcwy3" }, { name: "Foot numbness", entity: "/m/0dl9sn8" }, { name: "Foot pain", entity: "/m/0dl9s3c" }, { name: "Forchheimer spots", entity: "/m/05q52l8" }, { name: "Forehead pain", entity: "/m/0dl9qd1" }, { name: "Foreign body sensation", entity: "/m/04kfh3v" }, { name: "Forgetfulness", entity: "/m/05bl1h2" }, { name: "Formication", entity: "/m/02p4g5n" }, { name: "Fothergill's sign", entity: "/m/0bdpwk" }, { name: "Foul smelling urine", entity: "/m/064f42c" }, { name: "Foul-smelling nasal discharge", entity: "/m/076r69g" }, { name: "Fourth heart sound", entity: "/m/04crvkn" }, { name: "Fox's sign", entity: "/m/05q7xv8" }, { name: "Fragile Skin Syndrome", entity: "/m/064dl32" }, { name: "Fragmentation of memory", entity: "/m/0j642f1" }, { name: "Frank's sign", entity: "/m/04jkg8w" }, { name: "Freckle", entity: "/m/0fyd3" }, { name: "Frequent respiratory infections", entity: "/m/06h44t6" }, { name: "Frequent urination", entity: "/m/0c3_wg5" }, { name: "Friedreich's sign", entity: "/m/027m5l6" }, { name: "Froment's sign", entity: "/m/05l1p0" }, { name: "Frontal release sign", entity: "/m/03c2y05" }, { name: "Frostbite", entity: "/m/0213yl" }, { name: "Fuchs' dystrophy", entity: "/m/05pb2q" }, { name: "Fugue state", entity: "/m/02ybr" }, { name: "Functio laesa", entity: "/m/04f1nj8" }, { name: "Furcation defect", entity: "/m/06zlvw6" }, { name: "Gait abnormality", entity: "/m/06h94m" }, { name: "Gait ataxia", entity: "/m/0dl9tc1" }, { name: "Galactorrhea", entity: "/m/03xmsb" }, { name: "Galactorrhea hyperprolactinemia", entity: "/m/0bmjnkb" }, { name: "Gallop rhythm", entity: "/m/0f87zq" }, { name: "Gallstone", entity: "/m/01q6mh" }, { name: "Gangrene", entity: "/m/01jj75" }, { name: "Garland's triad", entity: "/m/02pwkv7" }, { name: "Garlic breath", entity: "/m/0h_b7zb" }, { name: "Gastric distension", entity: "/m/01ppr8" }, { name: "Gastric varices", entity: "/m/0401r0" }, { name: "Gastritis", entity: "/m/03y91v" }, { name: "Gastroesophageal reflux disease", entity: "/m/01b_5g" }, { name: "Gastrointestinal bleeding", entity: "/m/03njtl" }, { name: "Gastrointestinal Disorder", entity: "/m/02kd1ry" }, { name: "Gastrointestinal distress", entity: "/m/0dl9t41" }, { name: "Gastrointestinal irritation", entity: "/m/0dl9tmv" }, { name: "Gastrointestinal ulcers", entity: "/m/04zh6_3" }, { name: "Gastroparesis", entity: "/m/02w1n2" }, { name: "Gelastic seizure", entity: "/m/0268flm" }, { name: "Generalised tonic-clonic seizure", entity: "/m/02r6d3v" }, { name: "Generalized anxiety disorder", entity: "/m/02zr3h" }, { name: "Generalized erythema", entity: "/m/05my3h5" }, { name: "Genital area pain", entity: "/m/05blznv" }, { name: "Genital nodule", entity: "/m/05blyt0" }, { name: "Genital sores", entity: "/m/077598r" }, { name: "Genital ulcer", entity: "/m/02qlk_2" }, { name: "Genital wart", entity: "/m/019thv" }, { name: "Genu varum", entity: "/m/03pk5z" }, { name: "Gestational hypertension", entity: "/m/03p2br" }, { name: "Giant-cell arteritis", entity: "/m/07s7n" }, { name: "Giddiness", entity: "/m/0dl9sxk" }, { name: "Gigantism", entity: "/m/01jmvq" }, { name: "Gingival enlargement", entity: "/m/02vl6qv" }, { name: "Gingival recession", entity: "/m/0dr8s9" }, { name: "Gingivitis", entity: "/m/01d20w" }, { name: "Girdle pain", entity: "/m/0dgrddn" }, { name: "Glabellar reflex", entity: "/m/0b7n41" }, { name: "Glabrousness", entity: "/m/05__9r" }, { name: "Gliosis", entity: "/m/0chqj1" }, { name: "Globus pharyngis", entity: "/m/0czdw5" }, { name: "Glomerulonephritis", entity: "/m/04gfv_" }, { name: "Glossitis", entity: "/m/07ckc_" }, { name: "Glossoptosis", entity: "/m/0fkvcg" }, { name: "Glucose Intolerance", entity: "/m/02kc27l" }, { name: "Glucose-6-phosphate dehydrogenase deficiency", entity: "/m/021tw2" }, { name: "Glycosuria", entity: "/m/05pcqg" }, { name: "Goitre", entity: "/m/036zm" }, { name: "Golden S sign", entity: "/m/05p6gjd" }, { name: "Goldstein's toe sign", entity: "/m/0f12tc" }, { name: "Gonadal atrophy", entity: "/m/06vzpcb" }, { name: "Gonadal dysgenesis", entity: "/m/02p9mm9" }, { name: "Gonda's sign", entity: "/m/05t0p53" }, { name: "Goodell's sign", entity: "/m/08kn5j" }, { name: "Goose bumps", entity: "/m/03ck2w" }, { name: "Gordon's sign", entity: "/m/05sz3_h" }, { name: "Gorlin sign", entity: "/m/02qlx7x" }, { name: "Gottron's sign", entity: "/m/0514gqp" }, { name: "Gout", entity: "/m/0ffxt" }, { name: "Gowers' sign", entity: "/m/046b2p" }, { name: "Graham Steell murmur", entity: "/m/03cn9fh" }, { name: "Grandiosity", entity: "/m/041cwm" }, { name: "Granuloma", entity: "/m/029fv3" }, { name: "Granuloma annulare", entity: "/m/0cvpr9" }, { name: "Graves' ophthalmopathy", entity: "/m/0fl3qm" }, { name: "Greasy hair", entity: "/m/0nbv1vz" }, { name: "Green stool", entity: "/m/075g6sb" }, { name: "Grey Turner's sign", entity: "/m/0515k0" }, { name: "Griffith's sign", entity: "/m/05q5pbx" }, { name: "Groin rash", entity: "/m/0dl9snj" }, { name: "Groin swelling", entity: "/m/0dl9t17" }, { name: "Ground-glass opacity", entity: "/m/0j26_bj" }, { name: "Growth hormone deficiency", entity: "/m/02xh6k" }, { name: "Guilt", entity: "/m/036s6" }, { name: "Gum Pathology", entity: "/m/0hsr984" }, { name: "Gum Pathology", entity: "/m/0hsr21q" }, { name: "Gum sore", entity: "/m/0dl9thm" }, { name: "Guttate psoriasis", entity: "/m/05c3rty" }, { name: "Gynecologic hemorrhage", entity: "/m/01q1wv" }, { name: "Gynecomastia", entity: "/m/07cszr" }, { name: "Haemolacria", entity: "/m/02675h9" }, { name: "Hair loss", entity: "/m/03bwzh1" }, { name: "Half and half nails", entity: "/m/05b0f3b" }, { name: "Hallucination", entity: "/m/0d3gy" }, { name: "Hallucinatory palinopsia", entity: "/m/011pzntg" }, { name: "Halo sign", entity: "/m/026f2g_" }, { name: "Halos around lights", entity: "/m/06_mrn4" }, { name: "Hamartia", entity: "/m/0p8yynf" }, { name: "Hamman's sign", entity: "/m/0cdg94" }, { name: "Hammer toe", entity: "/m/03vwp3" }, { name: "Hampton hump", entity: "/m/025yfnl" }, { name: "Hand numbness", entity: "/m/0dl9snq" }, { name: "Hand pain", entity: "/m/0dl9sny" }, { name: "Hand swelling", entity: "/m/0dl9t5l" }, { name: "Hand tremor", entity: "/m/0dl9sp5" }, { name: "Hannington-Kiff sign", entity: "/m/05q67j0" }, { name: "Happy demeanour", entity: "/m/05v7ktz" }, { name: "Hard Retinal Exudate", entity: "/m/0hsr98j" }, { name: "Hard Retinal Exudate", entity: "/m/0hsr21t" }, { name: "Harrison's groove", entity: "/m/02q2vg0" }, { name: "Hatchcock's sign", entity: "/m/05q7wss" }, { name: "Head swelling", entity: "/m/0dl9t9_" }, { name: "Headache", entity: "/m/0j5fv" }, { name: "Hearing loss", entity: "/m/014wq_" }, { name: "Hearing problem", entity: "/m/04tnmgr" }, { name: "Heart block", entity: "/m/031q2c" }, { name: "Heart click", entity: "/m/05mysbq" }, { name: "Heart failure", entity: "/m/01l2m3" }, { name: "Heart murmur", entity: "/m/01jg1z" }, { name: "Heartburn", entity: "/m/01bfsv" }, { name: "Heat intolerance", entity: "/m/0rpj80_" }, { name: "Heautoscopy", entity: "/m/026qjtk" }, { name: "Heavy legs", entity: "/m/051ynwt" }, { name: "Heberden's node", entity: "/m/054s8y" }, { name: "Heel pain", entity: "/m/0dl9sb4" }, { name: "Hegar's sign", entity: "/m/084stp" }, { name: "Heinz body", entity: "/m/0c58b0" }, { name: "Heliotrope rash", entity: "/m/0514gqw" }, { name: "Hemangioma", entity: "/m/03jcdy" }, { name: "Hematemesis", entity: "/m/02n2t1" }, { name: "Hematidrosis", entity: "/m/01p1by" }, { name: "Hematochezia", entity: "/m/02n2gk" }, { name: "Hematoma", entity: "/m/032ssz" }, { name: "Hematopoietic ulcer", entity: "/m/05q4j97" }, { name: "Hematospermia", entity: "/m/0bblkc" }, { name: "Hematuria", entity: "/m/02sc7d" }, { name: "Hemihypertrophy", entity: "/m/03h1038" }, { name: "Hemiparesis", entity: "/m/03j3s" }, { name: "Hemiparesthesia", entity: "/m/0r3w6pn" }, { name: "Hemiplegia", entity: "/m/04n8p1" }, { name: "Hemispatial neglect", entity: "/m/03ttjj" }, { name: "Hemolysis", entity: "/m/0j8q4" }, { name: "Hemolytic anemia", entity: "/m/02skgx" }, { name: "Hemoperitoneum", entity: "/m/0g9qbf" }, { name: "Hemoptysis", entity: "/m/01g920" }, { name: "Hemosiderin Deposition", entity: "/m/0hsr9c3" }, { name: "Hemosiderinuria", entity: "/m/02w7_tf" }, { name: "Hemothorax", entity: "/m/06rt3n" }, { name: "Hemotympanum", entity: "/m/04gvbrl" }, { name: "Hepatic encephalopathy", entity: "/m/046cxb" }, { name: "Hepatomegaly", entity: "/m/055_gj" }, { name: "Hepatopulmonary syndrome", entity: "/m/0273jfd" }, { name: "Hepatorenal syndrome", entity: "/m/06vqzq" }, { name: "Hepatosplenomegaly", entity: "/m/03zr21" }, { name: "Hepatotoxicity", entity: "/m/02clhl" }, { name: "Herald Patch", entity: "/m/06_3b_z" }, { name: "Hereditary multiple exostoses", entity: "/m/03y9lb" }, { name: "Heterochromia", entity: "/m/02w_rc" }, { name: "Heterochromic Iris", entity: "/m/0hsr9dq" }, { name: "Hibernating myocardium", entity: "/m/031ryh" }, { name: "Hiccup", entity: "/m/02p3nc" }, { name: "Hickey", entity: "/m/02497k" }, { name: "High fever", entity: "/m/0dl9tl9" }, { name: "High-arched palate", entity: "/m/0135xpqd" }, { name: "High-grade fever", entity: "/m/06_9btt" }, { name: "HigoumÃ©nakis' sign", entity: "/m/03hkgqq" }, { name: "Hilar adenopathy", entity: "/m/06_353x" }, { name: "Hip pain", entity: "/m/0dl9s3k" }, { name: "Hirano body", entity: "/m/074fyv" }, { name: "Hirsutism", entity: "/m/0ps0b" }, { name: "HIV disease-related drug reaction", entity: "/m/05f44rg" }, { name: "HIV-associated pruritus", entity: "/m/0641421" }, { name: "Hives", entity: "/m/03nky3" }, { name: "Hoffmann's sign", entity: "/m/08fkxt" }, { name: "Hollenhorst plaque", entity: "/m/0c2pby" }, { name: "Homans sign", entity: "/m/08ytrd" }, { name: "Homicidal ideation", entity: "/m/04125r2" }, { name: "Hoover's sign", entity: "/m/04q33th" }, { name: "Hoover's sign", entity: "/m/04q27cv" }, { name: "Hopelessness", entity: "/m/0dl9s6j" }, { name: "Hormonal disorders", entity: "/m/04tnmg3" }, { name: "Horner's syndrome", entity: "/m/04v0fj" }, { name: "Horseshoe kidney", entity: "/m/06gfc6" }, { name: "Hostility", entity: "/m/02p74_2" }, { name: "Hot flash", entity: "/m/033488" }, { name: "Howshipâ€“Romberg sign", entity: "/m/04n3pf3" }, { name: "Hunger", entity: "/m/0135xt" }, { name: "Hutchinson's pupil", entity: "/m/05q4106" }, { name: "Hutchinson's sign", entity: "/m/05q9wp1" }, { name: "Hutchinson's teeth", entity: "/m/036mdg" }, { name: "Hydrocele", entity: "/m/04vy02" }, { name: "Hydrocephalus", entity: "/m/01cw5r" }, { name: "Hyperactivity", entity: "/m/04txf7" }, { name: "Hyperacusis", entity: "/m/04xpzs" }, { name: "Hyperaemia", entity: "/m/08859_" }, { name: "Hyperalgesia", entity: "/m/03z_m7" }, { name: "Hyperammonemia", entity: "/m/02p0x7" }, { name: "Hyperandrogenism", entity: "/m/04n7g6q" }, { name: "Hypercalcaemia", entity: "/m/02k540" }, { name: "Hypercalciuria", entity: "/m/03bxj79" }, { name: "Hypercapnia", entity: "/m/02hlph" }, { name: "Hypercholesterolemia", entity: "/m/02k7pj" }, { name: "Hyperekplexia", entity: "/m/0c4304" }, { name: "Hyperemesis gravidarum", entity: "/m/06t7dc" }, { name: "Hypereosinophilia", entity: "/m/0gty88" }, { name: "Hyperesthesia", entity: "/m/0btccj" }, { name: "Hyperestrogenism", entity: "/m/0j_5n3_" }, { name: "Hyperglycemia", entity: "/m/0kfqw" }, { name: "Hypergraphia", entity: "/m/02hgsj" }, { name: "Hyperhidrosis", entity: "/m/03jbly" }, { name: "Hyperkalemia", entity: "/m/037h0g" }, { name: "Hyperkeratosis", entity: "/m/05qymp" }, { name: "Hyperkinesia", entity: "/m/027p8_f" }, { name: "Hyperlipidemia", entity: "/m/05f45h" }, { name: "Hypermobility", entity: "/m/0b9f_5" }, { name: "Hypernatremia", entity: "/m/03xr5j" }, { name: "Hyperosmia", entity: "/m/02x39__" }, { name: "Hyperoxia", entity: "/m/06wcg52" }, { name: "Hyperpathia", entity: "/m/02731s6" }, { name: "Hyperphosphatemia", entity: "/m/042g01" }, { name: "Hyperpigmentation", entity: "/m/046z7d" }, { name: "Hyperpigmentation of eyelid", entity: "/m/09rqbg3" }, { name: "Hyperreflexia", entity: "/m/04bl90" }, { name: "Hyperresonant Chest Wall Percussion", entity: "/m/0hsr9f1" }, { name: "Hypersalivation", entity: "/m/0fpjgc1" }, { name: "Hypersexuality", entity: "/m/01g5ln" }, { name: "Hypersomnia", entity: "/m/03cfcn" }, { name: "Hypertelorism", entity: "/m/08wwvw" }, { name: "Hypertension", entity: "/m/0k95h" }, { name: "Hyperthermia", entity: "/m/0k10t" }, { name: "Hyperthyroidism", entity: "/m/03hz0" }, { name: "Hypertonia", entity: "/m/092xnv" }, { name: "Hypertrichosis", entity: "/m/04lj5j" }, { name: "Hypertrichosis cubiti", entity: "/m/0g9y9nq" }, { name: "Hypertriglyceridemia", entity: "/m/02_sbz" }, { name: "Hypertrophic osteoarthropathy", entity: "/m/04czf0w" }, { name: "Hypertrophy", entity: "/m/02vrdn" }, { name: "Hypertrophy of the clitoris", entity: "/m/06_mn99" }, { name: "Hyperuricemia", entity: "/m/02hl8g" }, { name: "Hyperventilation", entity: "/m/021m_f" }, { name: "Hypervigilance", entity: "/m/085x_0" }, { name: "Hyphema", entity: "/m/08dkq0" }, { name: "Hypnic jerk", entity: "/m/01_wn1" }, { name: "Hypoactive sexual desire disorder", entity: "/m/0255l5" }, { name: "Hypoalbuminemia", entity: "/m/09bl05" }, { name: "Hypobulia", entity: "/m/0h1gt3g" }, { name: "Hypocalcaemia", entity: "/m/02k53m" }, { name: "Hypocalciuria", entity: "/m/0463t6w" }, { name: "Hypodactylia", entity: "/m/0df47x" }, { name: "Hypoesthesia", entity: "/m/027q6ds" }, { name: "Hypogeusia", entity: "/m/02qgl1w" }, { name: "Hypoglycemia", entity: "/m/03gwt" }, { name: "Hypogonadism", entity: "/m/038k4x" }, { name: "Hypogonadotropic hypogonadism", entity: "/m/0j_33wy" }, { name: "Hypohidrosis", entity: "/m/04yfs7" }, { name: "Hypokalemia", entity: "/m/03vmt0" }, { name: "Hypokinesia", entity: "/m/06_8j3" }, { name: "Hypomania", entity: "/m/0bk6q" }, { name: "Hypomelanic macules", entity: "/m/0ht87t7" }, { name: "Hypomenorrhea", entity: "/m/0412nq4" }, { name: "Hypomimia", entity: "/m/0262l9q" }, { name: "Hypoparathyroidism", entity: "/m/0340yl" }, { name: "Hypophonia", entity: "/m/0bbv3wx" }, { name: "Hypopigmentation", entity: "/m/048hpn" }, { name: "Hyporeflexia", entity: "/m/0dr4b5" }, { name: "Hyposmia", entity: "/m/0fjwcj" }, { name: "Hypotension", entity: "/m/02hvph" }, { name: "Hypothermia", entity: "/m/012rps" }, { name: "Hypothyroidism", entity: "/m/0hg11" }, { name: "Hypotonia", entity: "/m/03wbww" }, { name: "Hypouricemia", entity: "/m/09_m33" }, { name: "Hypoventilation", entity: "/m/02fwvl" }, { name: "Hypovolemia", entity: "/m/02hwb2" }, { name: "Hypoxemia", entity: "/m/025sd3c" }, { name: "Hypoxia", entity: "/m/03gns" }, { name: "Hypsarrhythmia", entity: "/m/0cdwzx" }, { name: "Iatrogenic polio", entity: "/m/05srlxf" }, { name: "Ichthyosis", entity: "/m/02wgfv" }, { name: "If fear takes over and one finds themselves suffering from physical symptoms", entity: "/m/0p9b8y3" }, { name: "Ileus", entity: "/m/0443mq" }, { name: "Illusory palinopsia", entity: "/m/011q023m" }, { name: "Imbalance", entity: "/m/0dl9tjv" }, { name: "Immobility", entity: "/m/0dl9s9q" }, { name: "Immunodeficiency", entity: "/m/02yg4w" }, { name: "Immunosuppression", entity: "/m/016mlj" }, { name: "Impaired exercise tolerance", entity: "/m/07711t_" }, { name: "Impetigo", entity: "/m/0mzty" }, { name: "Implantation bleeding", entity: "/m/013027b9" }, { name: "Impulsivity", entity: "/m/03d5xbx" }, { name: "Inattention", entity: "/m/0dl9szx" }, { name: "Incoherent speech", entity: "/m/0dl9t8x" }, { name: "Incontinence", entity: "/m/04zvx6w" }, { name: "Incoordination", entity: "/m/0dl9t2h" }, { name: "Increased Muscle Mass", entity: "/m/06_mn8y" }, { name: "Increased strength of pulse", entity: "/m/06b0xn4" }, { name: "Increased vaginal discharge", entity: "/m/04tnn60" }, { name: "Increased Vocal Fremitus", entity: "/m/0hsr9f9" }, { name: "Indigestion", entity: "/m/04kl78" }, { name: "Infarction", entity: "/m/02vnfx" }, { name: "Infection", entity: "/m/098s1" }, { name: "Inferiority complex", entity: "/m/03c9vn" }, { name: "Infertility", entity: "/m/018g78" }, { name: "Infiltrative ophthalmopathy", entity: "/m/02rj16b" }, { name: "inflamed lungs", entity: "/m/0514gp8" }, { name: "Inflammation", entity: "/m/0j7_w" }, { name: "Inflammatory bowel disease", entity: "/m/02x0yg" }, { name: "Influenza-like illness", entity: "/m/05_5py4" }, { name: "Ingrown hair", entity: "/m/0cmmcy" }, { name: "Inguinal lymphadenopathy", entity: "/m/0dl9spk" }, { name: "Injection Site Reaction", entity: "/m/04klp5q" }, { name: "Insomnia", entity: "/m/0ddwt" }, { name: "Intellectual disability", entity: "/m/09fz4" }, { name: "Intention tremor", entity: "/m/0ccqn_" }, { name: "Interictal dysphoric disorder", entity: "/m/0zdk7vt" }, { name: "Intermenstrual Bleed Per Vaginam", entity: "/m/0hsr9gb" }, { name: "Intermittent abdominal pain", entity: "/m/0dl9st_" }, { name: "Intermittent claudication", entity: "/m/04qydt" }, { name: "Internal bleeding", entity: "/m/02xb32" }, { name: "Internuclear ophthalmoplegia", entity: "/m/08hkdc" }, { name: "Interrupted aortic arch", entity: "/m/0gkds8" }, { name: "Intertrigo", entity: "/m/05l4gz" }, { name: "Intestinal cramps", entity: "/m/0dl9th4" }, { name: "Intestinal Obstruction", entity: "/m/05z1q5q" }, { name: "Intestinal pseudo-obstruction", entity: "/m/0bj09q" }, { name: "Intestinal varices", entity: "/m/0401rc" }, { name: "Intracerebral hemorrhage", entity: "/m/08g5q7" }, { name: "Intracranial aneurysm", entity: "/m/01g45j" }, { name: "Intractable Pain", entity: "/m/07y4xgg" }, { name: "Intranodal palisaded myofibroblastoma", entity: "/m/0h7msvs" }, { name: "Intrauterine growth restriction", entity: "/m/05pdffb" }, { name: "Inverse psoriasis", entity: "/m/05mrtv4" }, { name: "Inverted nipple", entity: "/m/071nxk" }, { name: "Iritis", entity: "/m/04jy9m" }, { name: "Iron deficiency", entity: "/m/014x04" }, { name: "Iron overload", entity: "/m/02n_ct" }, { name: "Irregular breathing", entity: "/m/0dl9s_l" }, { name: "Irregular menstruation", entity: "/m/05bm66n" }, { name: "Irregular vaginal bleeding", entity: "/m/0dl9tbm" }, { name: "Irritability", entity: "/m/083h_x" }, { name: "Irritable male syndrome", entity: "/m/05t28b" }, { name: "Irritant diaper dermatitis", entity: "/m/025r6w" }, { name: "Ischemia", entity: "/m/02gr6s" }, { name: "Isosthenuria", entity: "/m/026f2q6" }, { name: "Itch", entity: "/m/04kllm9" }, { name: "Itchy eyes", entity: "/m/0654nrv" }, { name: "Itchy scalp", entity: "/m/0775b_h" }, { name: "Jaundice", entity: "/m/0hgxh" }, { name: "Jaw claudication", entity: "/m/012n8p91" }, { name: "Jaw pain", entity: "/m/0dl9sjg" }, { name: "Joffroy's sign", entity: "/m/05q9ykd" }, { name: "Joint\t muscle and connective tissue pain", entity: "/m/05ncftj" }, { name: "Joint effusion", entity: "/m/0b74b60" }, { name: "Joint instability", entity: "/m/07y4x0b" }, { name: "Joint locking", entity: "/m/05p2zl8" }, { name: "Joint pain", entity: "/m/021hck" }, { name: "Joint stiffness", entity: "/m/088b11" }, { name: "Joint swelling", entity: "/m/0dl9s7p" }, { name: "Joint tenderness", entity: "/m/0dl9spt" }, { name: "Jugular venous distention", entity: "/m/074v8w9" }, { name: "Jugular venous pressure", entity: "/m/03f3w1" }, { name: "Kanavel's cardinal signs", entity: "/m/05q61pp" }, { name: "Kaposi's sarcoma", entity: "/m/0bqpg" }, { name: "Kayserâ€“Fleischer ring", entity: "/m/036mhw" }, { name: "Kehr's sign", entity: "/m/046y3g" }, { name: "Kelly's sign", entity: "/m/05q7d_4" }, { name: "Keratitis", entity: "/m/02dfr6" }, { name: "Keratocyst", entity: "/m/09rvk1t" }, { name: "Kerley lines", entity: "/m/0ck_v6" }, { name: "Kerr's sign", entity: "/m/0j7l6mj" }, { name: "Ketoacidosis", entity: "/m/02mwg6" }, { name: "Ketonuria", entity: "/m/095xr2" }, { name: "Khodadoust line", entity: "/m/0b6n52c" }, { name: "Kidney Damage", entity: "/m/02kb_v7" }, { name: "Kidney failure", entity: "/m/01psyx" }, { name: "Kidney irritation", entity: "/m/0j3ttcw" }, { name: "Kidney pain", entity: "/m/0dl9t4p" }, { name: "Kidney stone", entity: "/m/09hbx" }, { name: "Kinking hair", entity: "/m/05b1qcr" }, { name: "Knee effusion", entity: "/m/03bxmbn" }, { name: "Knee pain", entity: "/m/09v868h" }, { name: "Knuckle pain", entity: "/m/0dl9qd6" }, { name: "Kocher's sign", entity: "/m/0bbvr3p" }, { name: "Koebner phenomenon", entity: "/m/0gffcz" }, { name: "Koeppe's nodules", entity: "/m/05q5xyj" }, { name: "Koilonychia", entity: "/m/0gj4qx" }, { name: "Koplik's spots", entity: "/m/038d_j" }, { name: "Kussmaul breathing", entity: "/m/036mkm" }, { name: "Kussmaul's sign", entity: "/m/03f1lf" }, { name: "Kyphosis", entity: "/m/02jrl1" }, { name: "LÃ©pine's sign", entity: "/m/0gtxsrh" }, { name: "Labor pain", entity: "/m/07y4z32" }, { name: "Labored breathing", entity: "/m/09k6f04" }, { name: "Lack of concentration", entity: "/m/06wfn90" }, { name: "Lack of empathy", entity: "/m/06wfmq5" }, { name: "Lack of Remorse", entity: "/m/06wfmqn" }, { name: "Lacrimation", entity: "/m/0dl9sy8" }, { name: "Lacrimation decreased", entity: "/m/076rfxr" }, { name: "Lactose intolerance", entity: "/m/0fp3b" }, { name: "Ladin's sign", entity: "/m/05q3xhg" }, { name: "Lancisi's sign", entity: "/m/05q49dz" }, { name: "Lanugo", entity: "/m/04g22n" }, { name: "Large feet", entity: "/m/06vz7h7" }, { name: "Large forehead", entity: "/m/076rfy9" }, { name: "Large hand", entity: "/m/06vwpn1" }, { name: "Larrey's sign", entity: "/m/05q80rh" }, { name: "Laryngeal cleft", entity: "/m/0bbvqnv" }, { name: "Laryngitis", entity: "/m/02l37c" }, { name: "Laryngopharyngeal reflux", entity: "/m/047bx2y" }, { name: "Laryngospasm", entity: "/m/08zhxx" }, { name: "Lazarus sign", entity: "/m/063_d30" }, { name: "Leaning to one side", entity: "/m/0703vzb" }, { name: "Learning disability", entity: "/m/02qwpq0" }, { name: "Left Bundle Branch Block", entity: "/m/09k76g" }, { name: "Left lower quadrant abdominal pain", entity: "/m/0dl9skb" }, { name: "Left upper quadrant abdominal pain", entity: "/m/0dl9skl" }, { name: "Left ventricular hypertrophy", entity: "/m/04dxph" }, { name: "Leg cramps", entity: "/m/0dl9s41" }, { name: "Leg pain", entity: "/m/05blzp1" }, { name: "Leg rash", entity: "/m/0dl9qdc" }, { name: "Leopard skin", entity: "/m/05zj701" }, { name: "Leserâ€“TrÃ©lat sign", entity: "/m/08zm6q" }, { name: "Lesion", entity: "/m/01w0hx" }, { name: "Lethargy", entity: "/m/012815pn" }, { name: "Leucocoria", entity: "/m/0bswkr" }, { name: "Leukemia", entity: "/m/04psf" }, { name: "Leukemia cutis", entity: "/m/0642tmh" }, { name: "Leukemid", entity: "/m/063_l26" }, { name: "Leukocytosis", entity: "/m/03btw1" }, { name: "Leukocytosis in head trauma", entity: "/m/0fqmmqx" }, { name: "Leukopenia", entity: "/m/03zrfj" }, { name: "Leukoplakia", entity: "/m/03l365" }, { name: "Leukorrhea", entity: "/m/06kjt9" }, { name: "Levine's sign", entity: "/m/064v9c" }, { name: "Lhermitte's sign", entity: "/m/064n9x" }, { name: "Lightheadedness", entity: "/m/079p0q" }, { name: "Limbus sign", entity: "/m/0hzqvxv" }, { name: "Limited symptom attack", entity: "/m/02v_qsl" }, { name: "Limp", entity: "/m/04plrq" }, { name: "Lines of Zahn", entity: "/m/0286w6_" }, { name: "Lip numbness", entity: "/m/0dl9tgq" }, { name: "Lipodermatosclerosis", entity: "/m/04jh911" }, { name: "Lipodystrophy", entity: "/m/01l2st" }, { name: "Lisch nodule", entity: "/m/03yztw" }, { name: "Lisker's sign", entity: "/m/0958cm" }, { name: "Litten's sign", entity: "/m/05s_27m" }, { name: "Livedo racemosa", entity: "/m/0cz8jtj" }, { name: "Livedo reticularis", entity: "/m/08wrk9" }, { name: "Livedoid vasculitis", entity: "/m/06ztvxs" }, { name: "Liver damage", entity: "/m/0dfmqkk" }, { name: "Liver dysfunction", entity: "/m/0dl9s5k" }, { name: "Liver failure", entity: "/m/02psvcf" }, { name: "Liver pain", entity: "/m/0dl9t2y" }, { name: "Lloyd's sign", entity: "/m/04lf42r" }, { name: "Locked-in syndrome", entity: "/m/014mtn" }, { name: "Logorrhea", entity: "/m/09v4pxz" }, { name: "Loin pain", entity: "/m/0dl9sj8" }, { name: "Loneliness", entity: "/m/05c7vv" }, { name: "Loose skin folds", entity: "/m/06vxvkc" }, { name: "Lordosis", entity: "/m/03_039" }, { name: "Loss in contrast sensitivity", entity: "/m/06_mzmj" }, { name: "Loss of adipose tissue", entity: "/m/06vxvk5" }, { name: "Loss of color of oral mucous membranes", entity: "/m/06_5xcd" }, { name: "Loss of control while drinking", entity: "/m/07b56xk" }, { name: "Loss of height", entity: "/m/06vymcn" }, { name: "Loss of interest", entity: "/m/06wfz5f" }, { name: "loss of motor skills", entity: "/m/05v24j6" }, { name: "Loss of muscle control", entity: "/m/0dl9qdj" }, { name: "Loud breathing", entity: "/m/04rkydh" }, { name: "Low back pain", entity: "/m/020hwm" }, { name: "Low birth weight", entity: "/m/0dl9s49" }, { name: "Low nasal bridge", entity: "/m/076rfxy" }, { name: "Low-set ears", entity: "/m/04ct6c6" }, { name: "Lowenberg's sign", entity: "/m/0bh8863" }, { name: "Lower gastrointestinal hemorrhage", entity: "/m/0dl9s4j" }, { name: "Lower motor neuron lesion", entity: "/m/02q_qps" }, { name: "Lower neck mass", entity: "/m/04rkyd8" }, { name: "Lower respiratory tract infection", entity: "/m/03txkl" }, { name: "Lucid interval", entity: "/m/08sx5r" }, { name: "Lumbar hyperlordosis", entity: "/m/057nwjj" }, { name: "Lump in the palm", entity: "/m/07475k7" }, { name: "Lump on the eyelid", entity: "/m/072b9px" }, { name: "Lung damage", entity: "/m/0dl9qdp" }, { name: "Lupus headache", entity: "/m/05f4z9f" }, { name: "Lymphadenitis", entity: "/m/07y4x4x" }, { name: "Lymphedema", entity: "/m/04r36" }, { name: "Lymphocytopenia", entity: "/m/08z6j9" }, { name: "Lymphocytosis", entity: "/m/01jn3l" }, { name: "Lymphoid hyperplasia", entity: "/m/03cs5n6" }, { name: "MÃ_ller's sign", entity: "/m/0fltlr" }, { name: "MÃ¶bius sign", entity: "/m/05s_wdw" }, { name: "Macewen's sign", entity: "/m/049z6g" }, { name: "Macrocephaly", entity: "/m/07b8s3" }, { name: "Macroglossia", entity: "/m/069j2k" }, { name: "Maculopapular rash", entity: "/m/05lrqf" }, { name: "Magnan's sign", entity: "/m/05s_78v" }, { name: "Magnetic gait", entity: "/m/04csj2b" }, { name: "Major depressive disorder", entity: "/m/02bft" }, { name: "Major depressive episode", entity: "/m/0bf0tv" }, { name: "Malabsorption", entity: "/m/03f07j" }, { name: "Malaise", entity: "/m/0418s3" }, { name: "Malar flush", entity: "/m/0tkcw_z" }, { name: "Malar rash", entity: "/m/04t_81" }, { name: "Male infertility", entity: "/m/03bx917" }, { name: "Malformed foreskin", entity: "/m/07719ll" }, { name: "Malformed hip sockets", entity: "/m/05v23h1" }, { name: "Malignant Skin Neoplasm", entity: "/m/04kl9cq" }, { name: "Malnutrition", entity: "/m/01m4w4" }, { name: "Malocclusion", entity: "/m/06r0ps" }, { name: "Mania", entity: "/m/05417" }, { name: "Manic episode", entity: "/m/01srx9" }, { name: "Markle sign", entity: "/m/05s_kz_" }, { name: "Mass on penis", entity: "/m/075yg4y" }, { name: "Masses in the mouth or face", entity: "/m/05lcl25" }, { name: "Massouh sign", entity: "/m/047snsg" }, { name: "Matchbox sign", entity: "/m/04f68fy" }, { name: "Mayne's sign", entity: "/m/05sy3y_" }, { name: "Mechanism of action", entity: "/m/0d2x17" }, { name: "meconium stained amniotic fluid", entity: "/m/0g4pnyz" }, { name: "Mediastinal fibrosis", entity: "/m/0f9f42" }, { name: "Medulloblastoma", entity: "/m/0bbl62" }, { name: "Megacolon", entity: "/m/07qctz" }, { name: "Megaloblast", entity: "/m/04f2b7p" }, { name: "Melancholia", entity: "/m/057vp" }, { name: "Melanocytic nevus", entity: "/m/0dc28" }, { name: "Melasma", entity: "/m/04z9bf" }, { name: "Melasma suprarenale", entity: "/m/077rqj" }, { name: "Melena", entity: "/m/02n2tg" }, { name: "Memory impairment", entity: "/m/03z97xk" }, { name: "Meningism", entity: "/m/04v_ml" }, { name: "Meningitis", entity: "/m/09d11" }, { name: "Menorrhagia", entity: "/m/031c33" }, { name: "Menstrual disorder", entity: "/m/0b5pfn" }, { name: "Mental decline", entity: "/m/0h80_xj" }, { name: "Mental disorder", entity: "/m/04x4r" }, { name: "Mental space", entity: "/m/0swnk68" }, { name: "Metabolic acidosis", entity: "/m/04tksh" }, { name: "Metabolic alkalosis", entity: "/m/025sktj" }, { name: "Metamorphopsia", entity: "/m/0j3cg_n" }, { name: "Metaplasia", entity: "/m/059h7h" }, { name: "Metastatic liver disease", entity: "/m/047cg9y" }, { name: "Methemoglobinemia", entity: "/m/01npzs" }, { name: "Metrorrhagia", entity: "/m/08_6kp" }, { name: "Microalbuminuria", entity: "/m/07y7r4" }, { name: "Microcalcification", entity: "/m/095qsg" }, { name: "Microcephaly", entity: "/m/01hrbm" }, { name: "Micrognathism", entity: "/m/0gjf_1" }, { name: "Micrographia", entity: "/m/0ch8r9" }, { name: "Micromastia", entity: "/m/09pv41" }, { name: "Microorchidism", entity: "/m/06_vzzv" }, { name: "Micropolygyria", entity: "/m/03c3y1s" }, { name: "Micropsia", entity: "/m/04fznr6" }, { name: "Midcycle spotting", entity: "/m/0dl9t3s" }, { name: "Middle back pain", entity: "/m/09rlb3" }, { name: "Migraine", entity: "/m/05904" }, { name: "Mild cough", entity: "/m/0dl9qdv" }, { name: "Mild depression", entity: "/m/0dl9t8d" }, { name: "Mild fever", entity: "/m/0dl9qd_" }, { name: "Milium", entity: "/m/0527by" }, { name: "Milk-rejection sign", entity: "/m/0kfxxw4" }, { name: "Miosis", entity: "/m/03smvc" }, { name: "Mistrust", entity: "/m/03ck46w" }, { name: "Mitral valve prolapse", entity: "/m/02np4g" }, { name: "Mixed affective state", entity: "/m/05mzxw" }, { name: "Mole color changes", entity: "/m/04nlqqp" }, { name: "Moniz sign", entity: "/m/05sz45p" }, { name: "Monoclonal gammopathy", entity: "/m/05fc8yb" }, { name: "Monocular Polyopia", entity: "/m/06_mqz2" }, { name: "Monomelic amyotrophy", entity: "/m/06399d" }, { name: "Monoparesis - leg", entity: "/m/0dl9s__" }, { name: "Monoplegia", entity: "/m/08bnqd" }, { name: "Monothematic delusion", entity: "/m/08vx8s" }, { name: "Mood disorder", entity: "/m/0drn8" }, { name: "Mood swing", entity: "/m/022y3k" }, { name: "Moodiness", entity: "/m/0dl9stt" }, { name: "Moon face", entity: "/m/02prmbk" }, { name: "Morning sickness", entity: "/m/01j9hg" }, { name: "Morphea", entity: "/m/09lkp9" }, { name: "Morsicatio buccarum", entity: "/m/0bwgtst" }, { name: "Motion sickness", entity: "/m/0gxcc" }, { name: "Motor restlessness", entity: "/m/07873tt" }, { name: "Motor Skills Disorders", entity: "/m/05m9tg" }, { name: "Motor weakness", entity: "/m/0dl9qf4" }, { name: "Mottled skin", entity: "/m/0dl9srn" }, { name: "Mouth breathing", entity: "/m/08gzn6" }, { name: "Mouth lesion", entity: "/m/0dl9s61" }, { name: "Mouth sore", entity: "/m/0dl9syy" }, { name: "Mouth ulcer", entity: "/m/01klhb" }, { name: "Movement disorders", entity: "/m/03whtc" }, { name: "Mucopurulent discharge", entity: "/m/0c0g_p" }, { name: "Mucosal lentigines", entity: "/m/064klw1" }, { name: "Muehrcke's nails", entity: "/m/02z08b_" }, { name: "Muffled\t decreased   heart sounds", entity: "/m/06b0xnv" }, { name: "Mulberry molar", entity: "/m/0crg69x" }, { name: "Mulder's sign", entity: "/m/02ql7wc" }, { name: "Multiple organ dysfunction syndrome", entity: "/m/03hnn3" }, { name: "Mumoli's sign", entity: "/m/027jv1q" }, { name: "Munro's microabscess", entity: "/m/05m_jf3" }, { name: "Munson's sign", entity: "/m/0415_dy" }, { name: "Murphy's sign", entity: "/m/071ttc" }, { name: "Muscle atrophy", entity: "/m/0dds0h" }, { name: "Muscle contraction", entity: "/m/046xb9" }, { name: "Muscle pain", entity: "/m/013677" }, { name: "Muscle paralysis", entity: "/m/0dl9t48" }, { name: "Muscle rigidity", entity: "/m/0dl9r5h" }, { name: "Muscle tension", entity: "/m/0dl9t0f" }, { name: "Muscle weakness", entity: "/m/0927l7" }, { name: "Muscular stiffness", entity: "/m/0dl9s8r" }, { name: "Musculoskeletal pain", entity: "/m/04klj9n" }, { name: "Musical hallucinations", entity: "/m/0p8zvc5" }, { name: "Muteness", entity: "/m/0287zzh" }, { name: "Mydriasis", entity: "/m/01dhgh" }, { name: "Myelodysplastic syndrome", entity: "/m/019gky" }, { name: "Myelopathy", entity: "/m/04_1ntx" }, { name: "Myerson's sign", entity: "/m/04vvbx" }, { name: "myeyes\tcom", entity: "/m/010dzj86" }, { name: "Myocardial infarction", entity: "/m/0gk4g" }, { name: "Myocardial scarring", entity: "/m/06w7x1v" }, { name: "Myoclonus", entity: "/m/02_mfs" }, { name: "Myoglobinuria", entity: "/m/08bbk2" }, { name: "Myopathic gait", entity: "/m/04cw8c5" }, { name: "Myopathy", entity: "/m/058k0k" }, { name: "Myxedema", entity: "/m/02wp6c" }, { name: "Nagayama's spots", entity: "/m/0c41jph" }, { name: "Nail clubbing", entity: "/m/02qbnn" }, { name: "Nail Detachment", entity: "/m/0zct3yp" }, { name: "Nail pitting", entity: "/m/010pyz4s" }, { name: "Narcissism", entity: "/m/0dvxcy" }, { name: "Narrow stools", entity: "/m/04mvdf9" }, { name: "Nasal breathing", entity: "/m/09prs9" }, { name: "Nasal congestion", entity: "/m/05s5v6" }, { name: "Nasal polyp", entity: "/m/034hsj" }, { name: "Nasal septum deviation", entity: "/m/05cz29" }, { name: "Nausea", entity: "/m/0gxb2" }, { name: "Near-sightedness", entity: "/m/0m2w3" }, { name: "Neck itch", entity: "/m/0dl9qf9" }, { name: "Neck mass", entity: "/m/0crhp0y" }, { name: "Neck pain", entity: "/m/02r3cvb" }, { name: "Neck rash", entity: "/m/0dl9tg2" }, { name: "Neck spasm", entity: "/m/043s7zg" }, { name: "Neck stiffness", entity: "/m/0bmgh43" }, { name: "Neck swelling", entity: "/m/0dl9t66" }, { name: "Necrobiosis", entity: "/m/03m3q96" }, { name: "Necrolytic acral erythema", entity: "/m/0c3x745" }, { name: "Necrosis", entity: "/m/09yql" }, { name: "Neonatal jaundice", entity: "/m/074hph" }, { name: "Neovascularization", entity: "/m/0bk1jp" }, { name: "Nephritic syndrome", entity: "/m/06yg6t" }, { name: "Nephrocalcinosis", entity: "/m/02py_03" }, { name: "Nephromegaly", entity: "/m/043ryvl" }, { name: "Nephrotic syndrome", entity: "/m/01n597" }, { name: "Nerve injury", entity: "/m/02pm604" }, { name: "Neuralgia", entity: "/m/05kzxm" }, { name: "Neurobehavioral Manifestations", entity: "/m/07y4z50" }, { name: "Neurofibroma", entity: "/m/08gljx" }, { name: "Neurogenic claudication", entity: "/m/02x2gtl" }, { name: "Neuroinflammation", entity: "/m/0zbvc0s" }, { name: "Neuromuscular Blockade", entity: "/m/0hqz3dg" }, { name: "Neuropathic Pain", entity: "/m/09gnhp2" }, { name: "Neutrophilia", entity: "/m/01jjvn" }, { name: "Nevus spilus", entity: "/m/05m_5tq" }, { name: "Nicoladoni sign", entity: "/m/04mxtkc" }, { name: "Nicotine withdrawal", entity: "/m/027ymbg" }, { name: "Night sweats", entity: "/m/04klgqw" }, { name: "Night terror", entity: "/m/0272zb" }, { name: "Nightmare", entity: "/m/0cjgc" }, { name: "Nikolsky's sign", entity: "/m/096_r8" }, { name: "Nipple discharge", entity: "/m/04696g" }, { name: "Nipple itch", entity: "/m/0dl9qfg" }, { name: "Nipple tenderness", entity: "/m/04mv7sh" }, { name: "Nocturia", entity: "/m/0868jh" }, { name: "Nocturnal Cough", entity: "/m/06gx48f" }, { name: "Nocturnal enuresis", entity: "/m/01wy8y" }, { name: "Nodule", entity: "/m/0905_p" }, { name: "Noma neonatorum", entity: "/m/0c41n16" }, { name: "Nonossifying fibroma", entity: "/m/05p2wz1" }, { name: "Nonpalpable purpura", entity: "/m/0dl9qfm" }, { name: "Nosebleed", entity: "/m/02zbth" }, { name: "Nosophobia", entity: "/m/027__kf" }, { name: "Nuclear sclerosis", entity: "/m/0bbmp2" }, { name: "Nucleated red blood cell", entity: "/m/012w48z4" }, { name: "Numbness in leg", entity: "/m/0dl9tg8" }, { name: "Numbness of face", entity: "/m/0dl9sm4" }, { name: "Numbness of the face or tongue", entity: "/m/05lcl1x" }, { name: "Nyctalopia", entity: "/m/04970l" }, { name: "Nystagmus", entity: "/m/01skrq" }, { name: "Obesity", entity: "/m/0fltx" }, { name: "Obsessive Health research", entity: "/m/06x7t9m" }, { name: "Obsessive thoughts about perceived appearance defect", entity: "/m/06wfzs1" }, { name: "Obstructed defecation", entity: "/m/0m0ph75" }, { name: "Obtundation", entity: "/m/0b0kl9" }, { name: "Obturator sign", entity: "/m/0d0_xj" }, { name: "Occupation pollution exposure", entity: "/m/06h45s3" }, { name: "Ocular rosacea", entity: "/m/03rd74" }, { name: "Oculocutaneous albinism", entity: "/m/047glfs" }, { name: "odd sensations", entity: "/m/011l_39k" }, { name: "Odynophagia", entity: "/m/0997hp" }, { name: "Odynorgasmia", entity: "/m/03cx4hf" }, { name: "Oily skin", entity: "/m/0dl9sfn" }, { name: "Oligodactyly", entity: "/m/0b743ls" }, { name: "Oligomenorrhea", entity: "/m/04yyq8" }, { name: "Oligospermia", entity: "/m/06z9sn" }, { name: "Oliguria", entity: "/m/04b1kq" }, { name: "Oliver's sign", entity: "/m/0c2p34" }, { name: "One hip higher than the other", entity: "/m/0703vvz" }, { name: "One recognizes that avoiding germs is taking over daily routines", entity: "/m/0p9b95_" }, { name: "Oneiroid syndrome", entity: "/m/027g3ht" }, { name: "Onychocryptosis", entity: "/m/0476hh" }, { name: "Onychorrhexis", entity: "/m/090ryn" }, { name: "Onychoschizia", entity: "/m/05b2v23" }, { name: "Ophthalmoparesis", entity: "/m/08grsz" }, { name: "Opisthotonus", entity: "/m/04bm26" }, { name: "Oppenheim's sign", entity: "/m/04qb4w9" }, { name: "Opportunistic infection", entity: "/m/064f44" }, { name: "Optic atrophy", entity: "/m/04_v74" }, { name: "Optic nerve hypoplasia", entity: "/m/03qvff" }, { name: "Optic neuritis", entity: "/m/05pzb" }, { name: "Optic papillitis", entity: "/m/065zh_3" }, { name: "Oral bleeding", entity: "/m/04r4mtz" }, { name: "Oral infection", entity: "/m/05blzpg" }, { name: "Oral Manifestations", entity: "/m/07y4xdl" }, { name: "Oral pain", entity: "/m/05h08ft" }, { name: "Orange urine", entity: "/m/0dl9t0m" }, { name: "Organ dysfunction", entity: "/m/04y5q8x" }, { name: "Organomegaly", entity: "/m/06b4_8" }, { name: "Orofacial pain", entity: "/m/0wf_p0n" }, { name: "Oropharyngeal dysphagia", entity: "/m/047gmhk" }, { name: "Orthopnea", entity: "/m/02lmp9" }, { name: "Orthostatic hypertension", entity: "/m/0hn9q6v" }, { name: "Orthostatic hypotension", entity: "/m/0pv4d" }, { name: "Oscillopsia", entity: "/m/06c4t0" }, { name: "Osler's node", entity: "/m/04ndcq" }, { name: "Ossification", entity: "/m/050qm0" }, { name: "Osteitis fibrosa cystica", entity: "/m/08wf7p" }, { name: "Osteomalacia", entity: "/m/02npcz" }, { name: "Osteopenia", entity: "/m/04zh7_m" }, { name: "Osteophyte", entity: "/m/03kb14" }, { name: "Osteoporosis", entity: "/m/05mdx" }, { name: "Osteoporosis circumscripta", entity: "/m/0gk_k_6" }, { name: "Otitis", entity: "/m/0743mf" }, { name: "Otitis externa", entity: "/m/04w68t" }, { name: "Otorrhea", entity: "/m/04kd970" }, { name: "Ovarian apoplexy", entity: "/m/0dllr8l" }, { name: "Overweight", entity: "/m/01t6qr" }, { name: "Ovulation induction", entity: "/m/0bbvjx1" }, { name: "Pachyonychia", entity: "/m/07h75td" }, { name: "Paget's disease of the breast", entity: "/m/0360ph" }, { name: "Pain", entity: "/m/062t2" }, { name: "Pain aggravated by walking", entity: "/m/07467s1" }, { name: "Pain asymbolia", entity: "/m/05dp09" }, { name: "Pain behind the eyes", entity: "/m/0gk93mt" }, { name: "Pain in limb", entity: "/m/07vwp80" }, { name: "Pain in penis", entity: "/m/0dl9t1q" }, { name: "Painful erections", entity: "/m/075yg54" }, { name: "Painless testicular lump", entity: "/m/078hk06" }, { name: "Pale feces", entity: "/m/06gb5_z" }, { name: "Palilalia", entity: "/m/06qqyb" }, { name: "Palinopsia", entity: "/m/06rxny" }, { name: "Palla's sign", entity: "/m/05sygqd" }, { name: "Pallor", entity: "/m/03skrx" }, { name: "Palmar erythema", entity: "/m/071rm6" }, { name: "Palpable precordial thrill", entity: "/m/06b0xp0" }, { name: "Palpable purpura", entity: "/m/0dl9s6w" }, { name: "Palpitations", entity: "/m/029ggh" }, { name: "Pancolitis", entity: "/m/03c8wh1" }, { name: "Pancreatitis", entity: "/m/0h1wz" }, { name: "Pancytopenia", entity: "/m/063jn6" }, { name: "Panic", entity: "/m/01t09s" }, { name: "Panic attack", entity: "/m/0g88b" }, { name: "Pansystolic murmur", entity: "/m/07704v0" }, { name: "Papilledema", entity: "/m/01c9lj" }, { name: "Papillomatosis", entity: "/m/04q1s_9" }, { name: "Papule", entity: "/m/04xgtj" }, { name: "Parakeratosis", entity: "/m/04q8vlf" }, { name: "Paralysis", entity: "/m/05sj8" }, { name: "Paranoia", entity: "/m/063zb" }, { name: "Paranoid states (Delusional disorders)", entity: "/m/07vtzbg" }, { name: "Paraphasia", entity: "/m/02qdsw7" }, { name: "Paraplegia", entity: "/m/0251gx" }, { name: "Paresis", entity: "/m/01ny_g" }, { name: "Paresthesia", entity: "/m/023m3v" }, { name: "Parkinsonian gait", entity: "/m/0bwj7fw" }, { name: "Parkinsonism", entity: "/m/0dcs4" }, { name: "Parosmia", entity: "/m/065swx" }, { name: "Paroxysmal nocturnal dyspnea", entity: "/m/0gttzbm" }, { name: "Paroxysmal ventricular tachycardia", entity: "/m/07vvb6b" }, { name: "Parrot's sign", entity: "/m/0711g3" }, { name: "Pastia's lines", entity: "/m/05t0qts" }, { name: "Pathological jealousy", entity: "/m/01l954" }, { name: "Pathological lying", entity: "/m/089sp6" }, { name: "Pauci-immune", entity: "/m/05b4v5v" }, { name: "Peanut allergy", entity: "/m/085pjw" }, { name: "Peau d'orange", entity: "/m/09szn7" }, { name: "Pectus carinatum", entity: "/m/05l8yp" }, { name: "Pectus excavatum", entity: "/m/03750f" }, { name: "Pelvic girdle pain", entity: "/m/02w6zqg" }, { name: "Pelvic Infection", entity: "/m/07y4xhs" }, { name: "Pelvic inflammatory disease", entity: "/m/064fq" }, { name: "Pelvic lipomatosis", entity: "/m/0kr76" }, { name: "Pelvic organ prolapse", entity: "/m/07kyr1" }, { name: "Pelvic pain", entity: "/m/0754ln" }, { name: "Pemberton's sign", entity: "/m/038dtb" }, { name: "Penile discharge", entity: "/m/059nnns" }, { name: "Penile ulcer", entity: "/m/0dl9sq8" }, { name: "Penile warts", entity: "/m/0dfmql_" }, { name: "Penis shortening", entity: "/m/075yg5b" }, { name: "Peptic ulcer", entity: "/m/0h3h4" }, { name: "Perianal pain", entity: "/m/05blzq4" }, { name: "Peribronchial cuffing", entity: "/m/03hk_lf" }, { name: "Pericardial effusion", entity: "/m/08z994" }, { name: "Pericardial friction rub", entity: "/m/0879yd" }, { name: "Pericardial sounds", entity: "/m/06b0xn0" }, { name: "Pericarditis", entity: "/m/032snl" }, { name: "Perichondritis", entity: "/m/0c012dy" }, { name: "Periorbital dark circles", entity: "/m/04cbz5" }, { name: "Periorbital edema", entity: "/m/0dl9s71" }, { name: "Periorbital puffiness", entity: "/m/027pqtp" }, { name: "Peripheral edema", entity: "/m/06v6kk" }, { name: "Peripheral Motor Neuropathy", entity: "/m/04klp1j" }, { name: "Peripheral neuropathy", entity: "/m/02w1fx" }, { name: "Peripheral venous distention", entity: "/m/0dl9qfs" }, { name: "Peripheral venous distention\t jugular distention", entity: "/m/06b0xmv" }, { name: "Peritonsillar abscess", entity: "/m/04b586" }, { name: "Persecutory delusion", entity: "/m/09g6vr0" }, { name: "Perseveration", entity: "/m/0dkpdn" }, { name: "Persistent edema of rosacea", entity: "/m/0521vqs" }, { name: "Persistent headache", entity: "/m/0dl9tb6" }, { name: "Persistent hunger", entity: "/m/075g6s4" }, { name: "Persistent truncus arteriosus", entity: "/m/07dlyv" }, { name: "Persistent tunica vasculosa lentis", entity: "/m/0dxvz3" }, { name: "Persistent urge to urinate", entity: "/m/075v3bq" }, { name: "Persistent vegetative state", entity: "/m/01rvjp" }, { name: "Persistent vomiting", entity: "/m/07vvdf5" }, { name: "Personality change", entity: "/m/0dl9rz6" }, { name: "Personality or behavior changes", entity: "/m/04tnmgc" }, { name: "Perspiration", entity: "/m/0k9qw" }, { name: "Petechia", entity: "/m/04c2n0" }, { name: "Phantom pain", entity: "/m/065_qd" }, { name: "Phantom vibration syndrome", entity: "/m/0gcq2w" }, { name: "Phantosmia", entity: "/m/0d7sj2" }, { name: "Pharyngitis", entity: "/m/01gkcc" }, { name: "Phlebitis", entity: "/m/03rwrr" }, { name: "Phlegm", entity: "/m/01s3l8" }, { name: "Phobia has persisted over a significant length of time and is affecting oneâ€™s health\t mood   work or family life", entity: "/m/0p9b95f" }, { name: "Phocomelia", entity: "/m/0jzx0" }, { name: "Phonological deficit", entity: "/m/02rr053" }, { name: "Phonophobia", entity: "/m/08r62l" }, { name: "Phosphene", entity: "/m/038s2d" }, { name: "Photodermatitis", entity: "/m/03c2dk" }, { name: "Photophobia", entity: "/m/02lv8g" }, { name: "Photopsia", entity: "/m/09p809" }, { name: "Photosensitivity in humans", entity: "/m/07k9gz9" }, { name: "Photosensitivity with HIV infection", entity: "/m/05sxrqt" }, { name: "Phototoxicity", entity: "/m/067w_4" }, { name: "Phrenitis", entity: "/m/047cfz7" }, { name: "Phyllodes tumor", entity: "/m/07mvcp" }, { name: "Physical dependence", entity: "/m/059w29" }, { name: "Pica", entity: "/m/01b8zz" }, { name: "Pigmented lesions", entity: "/m/0dl9tk0" }, { name: "Pili torti", entity: "/m/0462xkz" }, { name: "Pinch mark", entity: "/m/0bhbwcq" }, { name: "Piskacek's sign", entity: "/m/03gr_p9" }, { name: "Placental abruption", entity: "/m/0508hk" }, { name: "Plaque", entity: "/m/04q1ncc" }, { name: "Platypnea", entity: "/m/03d6pnm" }, { name: "Pleocytosis", entity: "/m/02q7v1x" }, { name: "Pleural friction rub", entity: "/m/04lgt34" }, { name: "Plummer's nail", entity: "/m/05s_9d1" }, { name: "Pneumatosis intestinalis", entity: "/m/0f47kd" }, { name: "Pneumaturia", entity: "/m/02qwdjd" }, { name: "Pneumonia", entity: "/m/0dq9p" }, { name: "Pneumonia alba", entity: "/m/0gjbz4s" }, { name: "Pneumothorax", entity: "/m/01q1sz" }, { name: "Polyarthritis", entity: "/m/06hxx0" }, { name: "Polycythemia", entity: "/m/02k88f" }, { name: "Polydipsia", entity: "/m/02v6kp" }, { name: "Polyneuropathy", entity: "/m/03cx49" }, { name: "Polyphagia", entity: "/m/03gncj" }, { name: "Polyuria", entity: "/m/01m3h8" }, { name: "Poor appetite", entity: "/m/0dl9sbn" }, { name: "Poor balance", entity: "/m/0dl9sfw" }, { name: "Poor coordination", entity: "/m/076r60r" }, { name: "Poor depth perception", entity: "/m/0727b9n" }, { name: "Poor feeding", entity: "/m/0dl9t5t" }, { name: "poor skin color at birth", entity: "/m/0g4pnz4" }, { name: "Poor wound healing", entity: "/m/06c4xv3" }, { name: "Portal hypertension", entity: "/m/034h9r" }, { name: "Post herniorraphy pain syndrome", entity: "/m/0ggb_w" }, { name: "Post-concussion syndrome", entity: "/m/09qljf" }, { name: "Post-dural-puncture headache", entity: "/m/03hlfpv" }, { name: "Post-nasal drip", entity: "/m/0615kf" }, { name: "Post-Operative Pain", entity: "/m/04yjg7n" }, { name: "Post-traumatic seizure", entity: "/m/03qcvl0" }, { name: "Post-void dribbling", entity: "/m/0bl95z" }, { name: "Postictal state", entity: "/m/0ctw0q" }, { name: "Postinflammatory hyperpigmentation", entity: "/m/05c4p7_" }, { name: "Postmenopausal vaginal bleeding", entity: "/m/0dl9qfy" }, { name: "Postoperative nausea and vomiting", entity: "/m/035vzc" }, { name: "Postorgasmic illness syndrome", entity: "/m/05p5_7y" }, { name: "Postural instability", entity: "/m/04dng0v" }, { name: "Postural orthostatic tachycardia syndrome", entity: "/m/04l6qx" }, { name: "Postural tremor", entity: "/m/0dl9sdw" }, { name: "Pratt's sign", entity: "/m/043s66f" }, { name: "Pre-eclampsia", entity: "/m/025lwc" }, { name: "Precocious puberty", entity: "/m/02_nx2" }, { name: "Prehn's sign", entity: "/m/0c81h2" }, { name: "Prehypertension", entity: "/m/03cz_hv" }, { name: "Premature Aging", entity: "/m/07y4yp0" }, { name: "Premature atrial contraction", entity: "/m/04kgzqg" }, { name: "Premature ejaculation", entity: "/m/01qqp1" }, { name: "Premature hair whitening", entity: "/m/06_5xc6" }, { name: "Premature ventricular contraction", entity: "/m/01hjkt" }, { name: "Premenstrual syndrome", entity: "/m/01fxrj" }, { name: "Preoccupation with Physical appearance", entity: "/m/06wfzsn" }, { name: "Pressure of speech", entity: "/m/08k8yw" }, { name: "Pressure ulcer", entity: "/m/03ncwn" }, { name: "Presystolic murmur", entity: "/m/0n48mtn" }, { name: "Pretibial myxedema", entity: "/m/0bdky5" }, { name: "Priapism", entity: "/m/0ldwy" }, { name: "Primarily obsessional obsessive compulsive disorder", entity: "/m/04n4w2k" }, { name: "Prion pruritus", entity: "/m/05b_g6g" }, { name: "Proctitis", entity: "/m/06rf7m" }, { name: "Prodrome", entity: "/m/01k7nc" }, { name: "Productive cough", entity: "/m/03gtw0t" }, { name: "Prognathism", entity: "/m/06g3nz" }, { name: "Progressive dementia", entity: "/m/0dl9t99" }, { name: "Projectile vomiting", entity: "/m/075g6rw" }, { name: "Prolapse", entity: "/m/01jcd6" }, { name: "Prolongations", entity: "/m/0g8256p" }, { name: "Prolonged capillary refill time", entity: "/m/06b0xmy" }, { name: "Prolonged fever", entity: "/m/0dl9s_4" }, { name: "Propulsive gait", entity: "/m/04cvmpm" }, { name: "Prostate pain", entity: "/m/0dl9sqm" }, { name: "Proteinuria", entity: "/m/012zf3" }, { name: "Protruded spinal cord", entity: "/m/07710f3" }, { name: "Protruding Tongue", entity: "/m/05t2w3m" }, { name: "Proximal muscle weakness", entity: "/m/0dl9s99" }, { name: "Prurigo", entity: "/m/0gk2pb" }, { name: "Pruritic papular eruption of HIV disease", entity: "/m/0bhc5r2" }, { name: "Pruritus ani", entity: "/m/02pq2mj" }, { name: "Pruritus of genital organs", entity: "/m/07vwn8h" }, { name: "Pruritus vulvae", entity: "/m/05mvdqy" }, { name: "Pseudarthrosis", entity: "/m/05_3zr" }, { name: "Pseudoachondroplasia", entity: "/m/026ljcg" }, { name: "Pseudobulbar affect", entity: "/m/04lg5mq" }, { name: "Pseudodiarrhea", entity: "/m/0bjszh" }, { name: "Pseudohallucination", entity: "/m/04q2n9f" }, { name: "Pseudohypertension", entity: "/m/0691c5" }, { name: "Pseudomembrane", entity: "/m/06vxvm8" }, { name: "Pseudomyopia", entity: "/m/026689f" }, { name: "Pseudopolyps", entity: "/m/0hzpvq0" }, { name: "Psoas sign", entity: "/m/0751ss" }, { name: "Psoriatic erythroderma", entity: "/m/05c4nbg" }, { name: "Psychogenic amnesia", entity: "/m/09hgk_" }, { name: "Psychogenic pain", entity: "/m/04ygjf4" }, { name: "Psychomotor agitation", entity: "/m/05p8sj" }, { name: "Psychomotor retardation", entity: "/m/03ytmb" }, { name: "Psychoorganic syndrome", entity: "/m/098crk" }, { name: "Psychosis", entity: "/m/063yv" }, { name: "Psychotic break", entity: "/m/03l9p5" }, { name: "Ptosis", entity: "/m/0gdsn5" }, { name: "Pubic nits", entity: "/m/05blybp" }, { name: "Puddle sign", entity: "/m/03c15k9" }, { name: "Pulmonary Arterial Hypertension", entity: "/m/04zh7j_" }, { name: "Pulmonary consolidation", entity: "/m/0b7jt4" }, { name: "Pulmonary edema", entity: "/m/0260ph" }, { name: "Pulmonary hemorrhage", entity: "/m/06t860" }, { name: "Pulmonary hypertension", entity: "/m/031wv7" }, { name: "Pulmonary infiltrate", entity: "/m/0yn_knd" }, { name: "Pulmonary insufficiency", entity: "/m/03cg1lz" }, { name: "Pulmonary shunt", entity: "/m/027x98v" }, { name: "Pulsatile Tinnitus", entity: "/m/0dfmqmw" }, { name: "Pulse deficit", entity: "/m/06b0xn8" }, { name: "Pulsus alternans", entity: "/m/02rxk72" }, { name: "Pulsus bigeminus", entity: "/m/0267wp8" }, { name: "Pulsus paradoxus", entity: "/m/087c0d" }, { name: "Pupil abnormalities", entity: "/m/0729kms" }, { name: "Purple urine bag syndrome", entity: "/m/06w5dlj" }, { name: "Purpura", entity: "/m/04c2m8" }, { name: "Purpura secondary to clotting disorders", entity: "/m/05q9m58" }, { name: "Pursed lip breathing", entity: "/m/06h3rg1" }, { name: "Purulent sputum", entity: "/m/0dl9ss3" }, { name: "Pus", entity: "/m/01s2ly" }, { name: "pus filled lumps", entity: "/m/06_183w" }, { name: "Pustule", entity: "/m/01fxyp" }, { name: "Pustulosis", entity: "/m/0f7x8r" }, { name: "Pyelonephritis", entity: "/m/04_rt_" }, { name: "Pyoderma gangrenosum", entity: "/m/08s9h0" }, { name: "Pyostomatitis vegetans", entity: "/m/06w1x7x" }, { name: "Pyuria", entity: "/m/08bp74" }, { name: "Raccoon eyes", entity: "/m/08810p" }, { name: "Racing thoughts", entity: "/m/03nps17" }, { name: "Radiculopathy", entity: "/m/02pfkpc" }, { name: "Raised cholesterol", entity: "/m/0dl9tcx" }, { name: "Rash on the palms and soles", entity: "/m/0dl9qg2" }, { name: "Raynaud syndrome", entity: "/m/02v2jk" }, { name: "Rectal discharge", entity: "/m/0dl9s9j" }, { name: "Rectal pain", entity: "/m/0b74tbc" }, { name: "Rectal prolapse", entity: "/m/03080q" }, { name: "Rectal tenesmus", entity: "/m/04yfk_" }, { name: "Recurrent infection", entity: "/m/0dl9spc" }, { name: "Recurrent urinary tract infection", entity: "/m/075v2vt" }, { name: "Red eye", entity: "/m/04pxm5" }, { name: "Red nose", entity: "/m/0dl9tc8" }, { name: "Red rash", entity: "/m/0dl9tmf" }, { name: "Red spots", entity: "/m/0dl9tm6" }, { name: "Reduced affect display", entity: "/m/08z6vk" }, { name: "Referred pain", entity: "/m/04gmgz" }, { name: "Regurgitation", entity: "/m/0fv217" }, { name: "Regurgitation", entity: "/m/0fv203" }, { name: "Regurgitation with acid", entity: "/m/0dl9td4" }, { name: "Relative bradycardia", entity: "/m/0dl9qg7" }, { name: "Religious delusion", entity: "/m/0h_9sk9" }, { name: "Remitting seronegative symmetrical synovitis with pitting edema", entity: "/m/05f6gm1" }, { name: "Renal colic", entity: "/m/06phzx" }, { name: "Renal cyst", entity: "/m/0b77v22" }, { name: "Respiratory acidosis", entity: "/m/04tkvk" }, { name: "Respiratory arrest", entity: "/m/037c4l" }, { name: "Respiratory distress", entity: "/m/0jwzzd9" }, { name: "Respiratory failure", entity: "/m/019dmc" }, { name: "Respiratory System Finding", entity: "/m/04kly2s" }, { name: "Respiratory tract infection", entity: "/m/0117wzhd" }, { name: "Rest pain", entity: "/m/05p1dzj" }, { name: "Restless legs syndrome", entity: "/m/01jyld" }, { name: "Restricted behavior", entity: "/m/05nmqpm" }, { name: "Retching", entity: "/m/02rjt8c" }, { name: "Reticulocytosis", entity: "/m/05d54_" }, { name: "Retinal degeneration", entity: "/m/05zn7mq" }, { name: "Retrograde amnesia", entity: "/m/040z8c" }, { name: "Retroperitoneal fibrosis", entity: "/m/09z7xt" }, { name: "Reynolds' pentad", entity: "/m/0ggv_7" }, { name: "Rheum", entity: "/m/02p1kqs" }, { name: "Rheumatoid nodule", entity: "/m/03m6bb0" }, { name: "Rheumatoid nodulosis", entity: "/m/0b767p_" }, { name: "Rhinitis", entity: "/m/02mdz9" }, { name: "Rhinophyma", entity: "/m/0dyhxj" }, { name: "Rhinorrhea", entity: "/m/06p_bp" }, { name: "Rhonchi", entity: "/m/09jv3z" }, { name: "Rib pain", entity: "/m/0dl9t5c" }, { name: "Riedel's thyroiditis", entity: "/m/02rjq7r" }, { name: "Riesman's sign", entity: "/m/05sxd2g" }, { name: "Right atrial enlargement", entity: "/m/07kj55d" }, { name: "Right lower quadrant abdominal pain", entity: "/m/0dl9t8m" }, { name: "Right upper quadrant pain", entity: "/m/0dl9sh3" }, { name: "Right ventricular hypertrophy", entity: "/m/025tjvy" }, { name: "Right-sided aortic arch", entity: "/m/0knm7d1" }, { name: "Rigler's sign", entity: "/m/09b5_f" }, { name: "Risus sardonicus", entity: "/m/09s7_h" }, { name: "Ritualistic behavior", entity: "/m/05nmqpv" }, { name: "Romana's sign", entity: "/m/02q4nr8" }, { name: "Rose spots", entity: "/m/0bj2by" }, { name: "Rosenstein's sign", entity: "/m/0crclyl" }, { name: "Rossolimo's sign", entity: "/m/05s_tyf" }, { name: "Roth's spot", entity: "/m/038dpt" }, { name: "Rough skin", entity: "/m/07t7mz6" }, { name: "Rovsing's sign", entity: "/m/04dbtp" }, { name: "Rumination", entity: "/m/04grp19" }, { name: "Rumination syndrome", entity: "/m/09spqk" }, { name: "Rumpelâ€“Leede sign", entity: "/m/05q6gh9" }, { name: "Running amok", entity: "/m/014sp" }, { name: "Russell's sign", entity: "/m/082wyl" }, { name: "Sacroiliac joint dysfunction", entity: "/m/0gtybk6" }, { name: "Sadness", entity: "/m/02y_3dj" }, { name: "Sail sign", entity: "/m/0273_l4" }, { name: "Sail sign of the chest", entity: "/m/0h1hr7b" }, { name: "Salt craving", entity: "/m/0dl9sqv" }, { name: "Salus's sign", entity: "/m/05sxjn6" }, { name: "Scab", entity: "/m/0dl9s8j" }, { name: "Scalp pain", entity: "/m/0dl9sr0" }, { name: "Scaly eyelid edges", entity: "/m/072b0hn" }, { name: "Scaly lesion", entity: "/m/0dl9tmn" }, { name: "Scaly rash", entity: "/m/0dl9sfg" }, { name: "Scaly skin", entity: "/m/06_2b8m" }, { name: "Scaphocephaly", entity: "/m/01hrg2" }, { name: "Scar", entity: "/m/0kbct" }, { name: "Scarring hair loss", entity: "/m/05222s7" }, { name: "Schaeffer's sign", entity: "/m/05s_28n" }, { name: "Schizophasia", entity: "/m/05qtd5" }, { name: "Sciatica", entity: "/m/01_wxr" }, { name: "Scissor gait", entity: "/m/04czg7h" }, { name: "Scleritis", entity: "/m/08gppk" }, { name: "Sclerodactyly", entity: "/m/05z058" }, { name: "Scleroderma", entity: "/m/05m_zv2" }, { name: "Scoliosis", entity: "/m/0yvgr" }, { name: "Scotoma", entity: "/m/03gzmf" }, { name: "Screaming", entity: "/m/03qc9zr" }, { name: "Scrotal mass", entity: "/m/0dl9s69" }, { name: "Scrotal rash", entity: "/m/0dl9sr6" }, { name: "Seborrheic dermatitis", entity: "/m/02cvvl" }, { name: "Second-degree atrioventricular block", entity: "/m/031s_5" }, { name: "Secondary cutaneous CD30+ large-cell lymphoma", entity: "/m/063yt9j" }, { name: "Secondary lymphedema", entity: "/m/05q9_31" }, { name: "Sedation", entity: "/m/019bf4" }, { name: "Seeing problems", entity: "/m/0h80_xb" }, { name: "Seeing spots", entity: "/m/0dl9qgk" }, { name: "Seidel sign", entity: "/m/047m0zn" }, { name: "Self-destructive behaviour", entity: "/m/026qvtc" }, { name: "Self-harm", entity: "/m/013cc9" }, { name: "Self-loathing", entity: "/m/057k0p" }, { name: "Sensitive hearing", entity: "/m/0dl9syq" }, { name: "Sensorineural hearing loss", entity: "/m/04fmz1" }, { name: "Sensory ataxia", entity: "/m/07_bsl" }, { name: "Sensory phenomena", entity: "/m/0h0qbm" }, { name: "Sentinel loop", entity: "/m/04q3mxq" }, { name: "Septic shock", entity: "/m/029mr9" }, { name: "Serosanguineous fluid", entity: "/m/06_p46d" }, { name: "Serotonin syndrome", entity: "/m/079hg" }, { name: "Severe anxiety", entity: "/m/0dl9qgq" }, { name: "Severe constipation", entity: "/m/0dfmqk7" }, { name: "Severe cough", entity: "/m/0dl9qgw" }, { name: "Severe joint pain", entity: "/m/0dl9qh0" }, { name: "Severe vomiting", entity: "/m/0dl9qh5" }, { name: "Sexual anhedonia", entity: "/m/0gfg_0y" }, { name: "Sexual dysfunction", entity: "/m/0255qr" }, { name: "Sexual headache", entity: "/m/07c5n9" }, { name: "Sexual obsessions", entity: "/m/027tv8t" }, { name: "Shakiness", entity: "/m/0dl9sxs" }, { name: "Shaking of hands", entity: "/m/0dl9tfw" }, { name: "Shallow breathing", entity: "/m/08wqjw" }, { name: "Shame", entity: "/m/0164bb" }, { name: "Sharing of Organs", entity: "/m/076r6lj" }, { name: "Shawl scrotum", entity: "/m/025_mtj" }, { name: "Sherren's triangle", entity: "/m/0hr6yls" }, { name: "Shivering", entity: "/m/04fv7w" }, { name: "Shock", entity: "/m/012n6d" }, { name: "Short attention span", entity: "/m/05v7kts" }, { name: "Short bowel syndrome", entity: "/m/04mr0d" }, { name: "Short neck", entity: "/m/07746vw" }, { name: "Short penis", entity: "/m/07746vp" }, { name: "Short stature", entity: "/m/06y96j" }, { name: "Shortness of breath", entity: "/m/01cdt5" }, { name: "Shoulder arthralgia", entity: "/m/0dl9sz4" }, { name: "Shoulder pain", entity: "/m/07y4xxk" }, { name: "Shyness", entity: "/m/01dl7h" }, { name: "Side pain", entity: "/m/0dl9tbf" }, { name: "Siegrist streaks", entity: "/m/02x0gvb" }, { name: "Sign of Hertoghe", entity: "/m/05t0j4w" }, { name: "Silhouette sign", entity: "/m/0bbz9bz" }, { name: "Simultanagnosia", entity: "/m/09g711n" }, { name: "Single transverse palmar crease", entity: "/m/04fl9l" }, { name: "Sinus arrest", entity: "/m/06b0xl0" }, { name: "Sinus arrhythmia", entity: "/m/057xmhq" }, { name: "Sinus bradycardia", entity: "/m/06rsk8" }, { name: "Sinus headache", entity: "/m/0d83xf4" }, { name: "Sinus pain", entity: "/m/0dl9t34" }, { name: "Sinus tachycardia", entity: "/m/06rsny" }, { name: "Sinus tract", entity: "/m/03h0kh2" }, { name: "Sinusitis", entity: "/m/072hv" }, { name: "Sister Mary Joseph nodule", entity: "/m/08wnv9" }, { name: "Sitting disability", entity: "/m/0dvg7b" }, { name: "Skeletal deformities", entity: "/m/0dl9srf" }, { name: "Skin and skin structure infection", entity: "/m/09gp35z" }, { name: "Skin bumps", entity: "/m/0dl9tdk" }, { name: "Skin burning sensation", entity: "/m/04kd9f3" }, { name: "Skin fissure", entity: "/m/0gmcs4z" }, { name: "Skin infection", entity: "/m/05m_2vv" }, { name: "Skin lesion", entity: "/m/04dfkg" }, { name: "Skin manifestations of sarcoidosis", entity: "/m/05zr0l8" }, { name: "Skin pain", entity: "/m/0dl9srx" }, { name: "Skin pop scar", entity: "/m/09v60_p" }, { name: "Skin rash", entity: "/m/0v4rnx" }, { name: "Skin tag", entity: "/m/0fktd" }, { name: "Skin ulcer", entity: "/m/01klgg" }, { name: "Skip lesion", entity: "/m/0c3y21x" }, { name: "Skull bossing", entity: "/m/0j260bd" }, { name: "Sleep apnea", entity: "/m/071d3" }, { name: "Sleep deprivation", entity: "/m/017tfz" }, { name: "Sleep disorder", entity: "/m/0cnmb" }, { name: "Sleep paralysis", entity: "/m/01jb2q" }, { name: "Sleeping difficulty", entity: "/m/0dl9sgh" }, { name: "Slight redness of skin in ear canal", entity: "/m/075v3xh" }, { name: "Slipped capital femoral epiphysis", entity: "/m/07bztx" }, { name: "SLUDGE syndrome", entity: "/m/025yc7f" }, { name: "Slurred speech", entity: "/m/03z97xw" }, { name: "Small baby", entity: "/m/0dl9s3t" }, { name: "Small feet", entity: "/m/076rg23" }, { name: "Sneeze", entity: "/m/01hsr_" }, { name: "Snoring", entity: "/m/01d3sd" }, { name: "Social isolation", entity: "/m/0c_k31" }, { name: "Soft erections", entity: "/m/075yg5j" }, { name: "Somatoparaphrenia", entity: "/m/02qd2dt" }, { name: "Somnolence", entity: "/m/0311pr" }, { name: "Sonographic Murphy sign", entity: "/m/0gx2ttd" }, { name: "Soot tattoo", entity: "/m/09v87qm" }, { name: "Sore on tongue", entity: "/m/0dl9thc" }, { name: "Sore throat", entity: "/m/0b76bty" }, { name: "Spalding's sign", entity: "/m/0bh88t5" }, { name: "Spasm", entity: "/m/04zjnsf" }, { name: "Spasm of accommodation", entity: "/m/02q477l" }, { name: "Spasmodic dysphonia", entity: "/m/07d0js" }, { name: "Spastic gait", entity: "/m/04cv6sj" }, { name: "Spastic hemiplegia", entity: "/m/0j3gp5p" }, { name: "Spastic paralysis", entity: "/m/0dl9s5c" }, { name: "Spastic paraparesis", entity: "/m/07y4xyt" }, { name: "Spasticity", entity: "/m/0p9n0" }, { name: "Speech delay", entity: "/m/0726rf" }, { name: "Speech disorder", entity: "/m/0133cx" }, { name: "Speech loss", entity: "/m/0dl9t3k" }, { name: "Spider angioma", entity: "/m/090j35" }, { name: "Spiking temperature", entity: "/m/0dl9s_b" }, { name: "Spinal tumor", entity: "/m/03znrn" }, { name: "Spitz nevus", entity: "/m/05mxp8t" }, { name: "Splenomegaly", entity: "/m/03zqp2" }, { name: "Splinter hemorrhage", entity: "/m/047qslv" }, { name: "Splitting", entity: "/m/02q48gs" }, { name: "Sputum", entity: "/m/01jmfg" }, { name: "Squeamishness", entity: "/m/076zwwj" }, { name: "ST depression", entity: "/m/05p5h7r" }, { name: "Stage fright", entity: "/m/02v58l" }, { name: "Stammering", entity: "/m/0dl9s4y" }, { name: "Starvation", entity: "/m/01flyj" }, { name: "Stasis dermatitis", entity: "/m/04q_81" }, { name: "Status epilepticus", entity: "/m/06382k" }, { name: "Steatorrhea", entity: "/m/03_7qy" }, { name: "Steeple sign", entity: "/m/02777d4" }, { name: "Stellwag's sign", entity: "/m/02z14sp" }, { name: "Stemmer's sign", entity: "/m/0fq0v0v" }, { name: "Stenosis", entity: "/m/032llx" }, { name: "Stereotypy", entity: "/m/0dg_lc" }, { name: "Stertor", entity: "/m/0d4b5s" }, { name: "Stiff Finger", entity: "/m/07468xq" }, { name: "Stiffness", entity: "/m/02dzkc" }, { name: "Stilted speech", entity: "/m/0h_d29d" }, { name: "Stimming", entity: "/m/0ch68q" }, { name: "Stimson line", entity: "/m/0jt1lyb" }, { name: "Stinging sensation", entity: "/m/05nb6gp" }, { name: "Stippled nails", entity: "/m/05b56rc" }, { name: "Stomach problems", entity: "/m/0dl9t60" }, { name: "Stomach rash", entity: "/m/0dl9qhb" }, { name: "Stomach rumble", entity: "/m/01g90h" }, { name: "Stomatitis", entity: "/m/06jf34" }, { name: "Stork leg", entity: "/m/05v23cw" }, { name: "StrÃ_mpell's sign", entity: "/m/05t03d3" }, { name: "Strabismus", entity: "/m/02s645" }, { name: "Strangury", entity: "/m/078v5g" }, { name: "Stransky's sign", entity: "/m/05s_76s" }, { name: "Strawberry tongue", entity: "/m/027sbw1" }, { name: "Stress", entity: "/m/012lyw" }, { name: "Stretch marks", entity: "/m/056g4k" }, { name: "Stridor", entity: "/m/05rtnw" }, { name: "String sign", entity: "/m/02r50n7" }, { name: "Stroke", entity: "/m/02y0js" }, { name: "Stunted growth", entity: "/m/09g54b" }, { name: "Stupor", entity: "/m/08gxks" }, { name: "Stuttering", entity: "/m/070yw" }, { name: "Subclinical seizure", entity: "/m/02r_80w" }, { name: "Subcutaneous emphysema", entity: "/m/0464mv7" }, { name: "Subcutaneous nodules", entity: "/m/0dl9s78" }, { name: "Subjective tinnitus", entity: "/m/09rqdw4" }, { name: "Substance abuse", entity: "/m/0p_cr" }, { name: "Substance dependence", entity: "/m/0466pc0" }, { name: "Sudden cardiac death", entity: "/m/0d_mn0" }, { name: "Sudden visual loss", entity: "/m/09rq8z1" }, { name: "Suicidal ideation", entity: "/m/09zn19" }, { name: "Sulcus sign", entity: "/m/0892ty" }, { name: "Sundowning", entity: "/m/04jmkz7" }, { name: "Superior vena cava syndrome", entity: "/m/04tr95" }, { name: "Suprapubic pain", entity: "/m/0dl9ssb" }, { name: "Supraventricular tachycardia", entity: "/m/03k_qd" }, { name: "Swelling", entity: "/m/09bdp3" }, { name: "Swelling behind the ear", entity: "/m/075z7_q" }, { name: "Swelling of finger", entity: "/m/0dl9sn1" }, { name: "Swelling of scrotum", entity: "/m/0dl9swy" }, { name: "Swelling of skin", entity: "/m/0dl9swq" }, { name: "Swollen feet", entity: "/m/0dl9t52" }, { name: "Swollen legs", entity: "/m/0dl9t72" }, { name: "Swollen lymph nodes", entity: "/m/03yzl6" }, { name: "Swollen testicle", entity: "/m/059nnnk" }, { name: "Swollen tonsils", entity: "/m/06tr55s" }, { name: "Sydenham's chorea", entity: "/m/04jr23" }, { name: "Syncope", entity: "/m/04jpj9y" }, { name: "Syndrome of inappropriate antidiuretic hormone secretion", entity: "/m/03zzcc" }, { name: "Syndrome of subjective doubles", entity: "/m/05rxzz" }, { name: "Synechia", entity: "/m/037xdl" }, { name: "Synovitis", entity: "/m/07yqh1" }, { name: "Systemic inflammation", entity: "/m/03h0d95" }, { name: "Systolic heart murmur", entity: "/m/05b5h0l" }, { name: "Tachycardia", entity: "/m/0156z4" }, { name: "Tachylalia", entity: "/m/03m9zmr" }, { name: "Tachypnea", entity: "/m/03w94wq" }, { name: "Tactile hallucination", entity: "/m/0zc0wnd" }, { name: "Tanning dependence", entity: "/m/03crfch" }, { name: "Tardive dyskinesia", entity: "/m/01vl0h" }, { name: "Target cell", entity: "/m/05rhhy" }, { name: "Teeth chattering", entity: "/m/05h08f_" }, { name: "Teeth--Discoloration", entity: "/m/0104fgr0" }, { name: "Telangiectasia", entity: "/m/0500_3" }, { name: "Tenderness", entity: "/m/03m4j90" }, { name: "Tendinitis", entity: "/m/01kcp2" }, { name: "Tenesmus", entity: "/m/05t0_0l" }, { name: "Tenosynovitis", entity: "/m/01nzjv" }, { name: "Teratospermia", entity: "/m/0523q1y" }, { name: "Terry's nails", entity: "/m/02py3_7" }, { name: "Tertiary hyperparathyroidism", entity: "/m/0bfvmv" }, { name: "Testicular mass", entity: "/m/0dl9ssk" }, { name: "Testicular pain", entity: "/m/05n03wb" }, { name: "Tet spells", entity: "/m/074x0fv" }, { name: "Tetanic contraction", entity: "/m/026m6v" }, { name: "Tetany", entity: "/m/02pnp2q" }, { name: "Tetralogy of Fallot", entity: "/m/01k4yc" }, { name: "Tetraplegia", entity: "/m/01bpld" }, { name: "Thick skin", entity: "/m/06vwpmt" }, { name: "Thin skin", entity: "/m/0dl9szd" }, { name: "Thiocyanate Toxicity", entity: "/m/0j3zb5d" }, { name: "Third-degree atrioventricular block", entity: "/m/02zcgm" }, { name: "Thirst", entity: "/m/02jx54" }, { name: "Thought blocking", entity: "/m/0cmcngp" }, { name: "Thought disorder", entity: "/m/01p1zm" }, { name: "Thought insertion", entity: "/m/09lpg2" }, { name: "Thousand-yard stare", entity: "/m/05dzzb" }, { name: "Throat clearing", entity: "/m/0dl9sf8" }, { name: "Throat infection", entity: "/m/02hx74p" }, { name: "Throat irritation", entity: "/m/0b6kt_8" }, { name: "Throbbing headache", entity: "/m/02kby4d" }, { name: "Throbbing pain", entity: "/m/0dl9svw" }, { name: "Thrombocytopenia", entity: "/m/02kgmg" }, { name: "Thrombocytosis", entity: "/m/03btxg" }, { name: "Thrombosis", entity: "/m/018_pw" }, { name: "Thumbprint sign", entity: "/m/02777qv" }, { name: "Thyroid disease", entity: "/m/05n00c6" }, { name: "Thyroid nodule", entity: "/m/05l6q9" }, { name: "Tic", entity: "/m/02gpbb" }, { name: "Tinel's sign", entity: "/m/04bn2w" }, { name: "Tingling feet", entity: "/m/0dl9tlk" }, { name: "Tingling fingers", entity: "/m/0dl9tff" }, { name: "Tingling lips", entity: "/m/0dl9tgy" }, { name: "Tingling of hands", entity: "/m/0dl9tlr" }, { name: "Tingling of toes", entity: "/m/0dl9tlz" }, { name: "Tinnitus", entity: "/m/0pv6y" }, { name: "Toe numbness", entity: "/m/0dl9t7w" }, { name: "Toe pain", entity: "/m/078693m" }, { name: "Toe paresthesia", entity: "/m/0dl9ss_" }, { name: "Toe walking", entity: "/m/02rm_y4" }, { name: "Tongue numbness", entity: "/m/0dl9t26" }, { name: "Tongue swelling", entity: "/m/0dl9sjq" }, { name: "Tongue ulcers", entity: "/m/0dl9sj0" }, { name: "Tonsillitis", entity: "/m/03ng0t" }, { name: "Tooth decay", entity: "/m/025j63" }, { name: "Tooth loss", entity: "/m/02q28kg" }, { name: "Tooth mobility", entity: "/m/010f9grj" }, { name: "Toothache", entity: "/m/045c85" }, { name: "Tophus", entity: "/m/04bm_r" }, { name: "Topographical disorientation", entity: "/m/0fq316n" }, { name: "Torticollis", entity: "/m/01q136" }, { name: "Traction bronchiectasis", entity: "/m/03cr05f" }, { name: "Tram track", entity: "/m/03hk_dl" }, { name: "Transformation obsession", entity: "/m/03gthmq" }, { name: "Transudate", entity: "/m/02wv9sp" }, { name: "Tree-in-bud sign", entity: "/m/03cr019" }, { name: "Trembling", entity: "/m/0dl9sdm" }, { name: "Tremor", entity: "/m/09d28" }, { name: "Trendelenburg gait", entity: "/m/09sdrd" }, { name: "Trendelenburg's sign", entity: "/m/07h5sd" }, { name: "Trepopnea", entity: "/m/025x27t" }, { name: "Trichiasis", entity: "/m/04m9wt" }, { name: "Trichomegaly", entity: "/m/09k5ncy" }, { name: "Trichoptilosis", entity: "/m/0269y8n" }, { name: "Trichotillomania", entity: "/m/0h_8y" }, { name: "Trigeminal autonomic cephalalgia", entity: "/m/011vmjv8" }, { name: "Tripe palms", entity: "/m/09k5vq8" }, { name: "Trismus", entity: "/m/01fgvy" }, { name: "Troisier's sign", entity: "/m/037xnt" }, { name: "Trousseau sign of latent tetany", entity: "/m/02pnnwh" }, { name: "Trousseau sign of malignancy", entity: "/m/02pnnwv" }, { name: "Tuberculoma", entity: "/m/01181t6w" }, { name: "Tullio phenomenon", entity: "/m/02rlx5d" }, { name: "Tunnel vision", entity: "/m/01z0b9" }, { name: "Type 2 diabetes", entity: "/m/0146bp" }, { name: "Ulcer of ankle", entity: "/m/09ryb3k" }, { name: "Ulcer of heel and midfoot", entity: "/m/09ryb3n" }, { name: "Ulcer of hip", entity: "/m/09ryb1p" }, { name: "Ulcer of pharynx", entity: "/m/0dl9tj4" }, { name: "Ulnar claw", entity: "/m/0466198" }, { name: "Unable to balance", entity: "/m/0dl9stl" }, { name: "Unconsciousness", entity: "/m/04kfhc9" }, { name: "Underweight", entity: "/m/0844zv" }, { name: "Uneven musculature on one side of the spine", entity: "/m/0703vrl" }, { name: "Uneven waist", entity: "/m/0703vrt" }, { name: "Unintentional Weight Loss", entity: "/m/06wfm2h" }, { name: "Unremitting headache", entity: "/m/0dfmqn1" }, { name: "Unresponsiveness", entity: "/m/0dl9st5" }, { name: "Unsteadiness", entity: "/m/01y2h01" }, { name: "Unsteady gait", entity: "/m/0dl9s9y" }, { name: "Upper gastrointestinal bleeding", entity: "/m/02n2jh" }, { name: "Upper motor neuron lesion", entity: "/m/052f98" }, { name: "Upper respiratory tract infection", entity: "/m/02wmyj" }, { name: "Upslanting palpebral fissures", entity: "/m/05t2w30" }, { name: "Uremia", entity: "/m/02f8hm" }, { name: "Uremic fetor", entity: "/m/0g9wnz_" }, { name: "Ureteral Calculi", entity: "/m/075v48g" }, { name: "Urethral discharge", entity: "/m/0dl9s82" }, { name: "Urethritis", entity: "/m/07wvs" }, { name: "Urge incontinence", entity: "/m/0bmbd36" }, { name: "Urge to move", entity: "/m/07873v5" }, { name: "Urinary dribbling", entity: "/m/0dl9s5v" }, { name: "Urinary hesitancy", entity: "/m/04qyzpf" }, { name: "Urinary incontinence", entity: "/m/018h13" }, { name: "Urinary retention", entity: "/m/045y32" }, { name: "Urinary tract infection", entity: "/m/07x16" }, { name: "Urinary urgency", entity: "/m/0fvh3d" }, { name: "Urine odor", entity: "/m/0dl9thx" }, { name: "Uterine contraction", entity: "/m/02shy2" }, { name: "Uveitis", entity: "/m/040_ch" }, { name: "Uveoparotitis", entity: "/m/0h6m4f" }, { name: "Vaginal bleeding", entity: "/m/055k6m" }, { name: "Vaginal bulge", entity: "/m/0dl9qhh" }, { name: "Vaginal discharge", entity: "/m/07k9rmb" }, { name: "Vaginal dryness", entity: "/m/0dl9stc" }, { name: "Vaginal flatulence", entity: "/m/017ts5" }, { name: "Vaginal itching", entity: "/m/0dl9s54" }, { name: "Vaginal odor", entity: "/m/05bjlj4" }, { name: "Vaginal pain", entity: "/m/0dl9sjy" }, { name: "Vaginal tenderness", entity: "/m/05bl1y2" }, { name: "Vaginitis", entity: "/m/01vcpr" }, { name: "Vague uncomfortable sensations", entity: "/m/07873t_" }, { name: "Varicose veins", entity: "/m/081dp" }, { name: "Vascular Leak", entity: "/m/06vzydh" }, { name: "Vascular malformation", entity: "/m/079tpsw" }, { name: "Vascular occlusion", entity: "/m/0b6h30_" }, { name: "Vasculitis", entity: "/m/0317gc" }, { name: "Vaso-occlusive crisis", entity: "/m/03nxk25" }, { name: "Vasoconstriction", entity: "/m/02wv6ss" }, { name: "Vasodilation", entity: "/m/0fkcf" }, { name: "Vasovagal syncope", entity: "/m/039y0d" }, { name: "Vegetation", entity: "/m/04gp557" }, { name: "Vegetative symptoms", entity: "/m/076zcl" }, { name: "Vegetative-vascular dystonia", entity: "/m/0wbjrwb" }, { name: "Velopharyngeal inadequacy", entity: "/m/0fqvw9" }, { name: "Venous stasis", entity: "/m/04jj6yp" }, { name: "Ventricular enlargement\t left  right or bilateral", entity: "/m/06b0xnr" }, { name: "Ventricular fibrillation", entity: "/m/0193gy" }, { name: "Ventricular outflow tract obstruction", entity: "/m/0gjdgxg" }, { name: "Ventricular septal defect", entity: "/m/03k28n" }, { name: "Ventricular tachycardia", entity: "/m/025v410" }, { name: "Verbosity", entity: "/m/045rjv" }, { name: "Vertigo", entity: "/m/07rwf2" }, { name: "Vesical tenesmus", entity: "/m/08gxj7" }, { name: "Viral pneumonia", entity: "/m/07fn78" }, { name: "Virilization", entity: "/m/032zt5" }, { name: "Virtual reality sickness", entity: "/m/011c6z46" }, { name: "Visceral pain", entity: "/m/0j9nwbn" }, { name: "Vision disorder", entity: "/m/04jmzm5" }, { name: "Vision loss", entity: "/m/04t973" }, { name: "Visual acuity", entity: "/m/02_g1v" }, { name: "Visual agnosia", entity: "/m/08gvtg" }, { name: "Visual discomfort", entity: "/m/09rq8z7" }, { name: "Visual disturbances", entity: "/m/07vv03c" }, { name: "Visual field defect\t unspecified", entity: "/m/09rq90l" }, { name: "Visual hallucinations", entity: "/m/0dl9sd6" }, { name: "Visual snow", entity: "/m/0379jz" }, { name: "Visual verbal agnosia", entity: "/m/06x607p" }, { name: "Vital Exhaustion", entity: "/m/04kfc4j" }, { name: "Vitamin B12 deficiency", entity: "/m/02x2xmj" }, { name: "Vitamin deficiency", entity: "/m/0q42v" }, { name: "Vocal cords atrophy", entity: "/m/05v23h7" }, { name: "Vocal fold block", entity: "/m/0wpl1bg" }, { name: "Voice change", entity: "/m/0hzmhkt" }, { name: "Vomiting", entity: "/m/012qjw" }, { name: "Von Braun-Fernwald's sign", entity: "/m/05t0hc2" }, { name: "Von Graefe's sign", entity: "/m/09tktp" }, { name: "Vulva rash", entity: "/m/0dl9qhn" }, { name: "Vulvar vestibulitis", entity: "/m/0h7q7v0" }, { name: "Vulvitis", entity: "/m/06qjbg" }, { name: "Vulvodynia", entity: "/m/08099" }, { name: "Wandering", entity: "/m/04jmb5n" }, { name: "Wanderlust", entity: "/m/038ytw" }, { name: "Warm skin", entity: "/m/06_hyyd" }, { name: "Wart", entity: "/m/086hz" }, { name: "Wasting", entity: "/m/01dpzh" }, { name: "Water retention", entity: "/m/05s_d8r" }, { name: "Waterâ€“electrolyte imbalance", entity: "/m/03nkmb" }, { name: "Watery diarrhea", entity: "/m/06vys2w" }, { name: "Watery stool", entity: "/m/0dl9sc9" }, { name: "Watson's water hammer pulse", entity: "/m/038dp3" }, { name: "Waxy flexibility", entity: "/m/02q672l" }, { name: "Waxy skin", entity: "/m/064p33j" }, { name: "Weak pulse", entity: "/m/06b0xmk" }, { name: "Weak urinary stream", entity: "/m/0dl9t0v" }, { name: "Weakness", entity: "/m/0119nqlg" }, { name: "Weakness of limb", entity: "/m/0dl9t83" }, { name: "Weakness of the arms and legs", entity: "/m/0h80_xq" }, { name: "Weather pains", entity: "/m/07k3xc6" }, { name: "Webbed neck", entity: "/m/01cn60" }, { name: "Weight gain", entity: "/m/03bx2xc" }, { name: "Weight loss", entity: "/m/023s6n" }, { name: "Westermark sign", entity: "/m/025yl42" }, { name: "Westphal's sign", entity: "/m/02qd587" }, { name: "Wheals", entity: "/m/079y7m" }, { name: "Wheeze", entity: "/m/07mzm6" }, { name: "White hand sign", entity: "/m/08dxt6" }, { name: "White stool", entity: "/m/0dl9qht" }, { name: "White tongue", entity: "/m/0dl9shv" }, { name: "Widened mediastinum", entity: "/m/0917_9" }, { name: "Widow's peak", entity: "/m/03d23v" }, { name: "Winterbottom's sign", entity: "/m/095yj5" }, { name: "Witzelsucht", entity: "/m/06f89r" }, { name: "Word salad", entity: "/m/02nj2r" }, { name: "Work aversion", entity: "/m/02w795_" }, { name: "Wound", entity: "/m/01xrk2" }, { name: "Wrinkle", entity: "/m/02_x63" }, { name: "Wrist pain", entity: "/m/09gfx99" }, { name: "Xanthoma", entity: "/m/02gl_t" }, { name: "Xanthoma striatum palmare", entity: "/m/07k6xsb" }, { name: "Xanthopsia", entity: "/m/0268n_w" }, { name: "Xanthosis", entity: "/m/02rxmf6" }, { name: "Xeroderma", entity: "/m/08xv95" }, { name: "Xerophthalmia", entity: "/m/0517c6" }, { name: "Xerostomia", entity: "/m/04d7y3" }, { name: "Yawn", entity: "/m/01j423" }, { name: "Yellow eyes", entity: "/m/0dl9tcq" }, { name: "Yellow-brown color of nails", entity: "/m/07h75ts" }, { name: "Zenker's degeneration", entity: "/m/03p_fd" }];

	var countries = exports.countries = [{ iso: "AF", name: "Afghanistan" }, { iso: "AX", name: "Åland" }, { iso: "AL", name: "Albania" }, { iso: "DZ", name: "Algeria" }, { iso: "AS", name: "American Samoa" }, { iso: "AD", name: "Andorra" }, { iso: "AO", name: "Angola" }, { iso: "AI", name: "Anguilla" }, { iso: "AQ", name: "Antarctica" }, { iso: "AG", name: "Antigua and Barbuda" }, { iso: "AR", name: "Argentina" }, { iso: "AM", name: "Armenia" }, { iso: "AW", name: "Aruba" }, { iso: "AU", name: "Australia" }, { iso: "AT", name: "Austria" }, { iso: "AZ", name: "Azerbaijan" }, { iso: "BS", name: "Bahamas" }, { iso: "BH", name: "Bahrain" }, { iso: "BD", name: "Bangladesh" }, { iso: "BB", name: "Barbados" }, { iso: "BY", name: "Belarus" }, { iso: "BE", name: "Belgium" }, { iso: "BZ", name: "Belize" }, { iso: "BJ", name: "Benin" }, { iso: "BM", name: "Bermuda" }, { iso: "BT", name: "Bhutan" }, { iso: "BO", name: "Bolivia" }, { iso: "BQ", name: "Bonaire" }, { iso: "BA", name: "Bosnia and Herzegovina" }, { iso: "BW", name: "Botswana" }, { iso: "BV", name: "Bouvet Island" }, { iso: "BR", name: "Brazil" }, { iso: "IO", name: "British Indian Ocean Territory" }, { iso: "VG", name: "British Virgin Islands" }, { iso: "BN", name: "Brunei" }, { iso: "BG", name: "Bulgaria" }, { iso: "BF", name: "Burkina Faso" }, { iso: "BI", name: "Burundi" }, { iso: "KH", name: "Cambodia" }, { iso: "CM", name: "Cameroon" }, { iso: "CA", name: "Canada" }, { iso: "CV", name: "Cape Verde" }, { iso: "KY", name: "Cayman Islands" }, { iso: "CF", name: "Central African Republic" }, { iso: "TD", name: "Chad" }, { iso: "CL", name: "Chile" }, { iso: "CN", name: "China" }, { iso: "CX", name: "Christmas Island" }, { iso: "CC", name: "Cocos [Keeling] Islands" }, { iso: "CO", name: "Colombia" }, { iso: "KM", name: "Comoros" }, { iso: "CK", name: "Cook Islands" }, { iso: "CR", name: "Costa Rica" }, { iso: "HR", name: "Croatia" }, { iso: "CU", name: "Cuba" }, { iso: "CW", name: "Curacao" }, { iso: "CY", name: "Cyprus" }, { iso: "CZ", name: "Czechia" }, { iso: "CD", name: "Democratic Republic of the Congo" }, { iso: "DK", name: "Denmark" }, { iso: "DJ", name: "Djibouti" }, { iso: "DM", name: "Dominica" }, { iso: "DO", name: "Dominican Republic" }, { iso: "TL", name: "East Timor" }, { iso: "EC", name: "Ecuador" }, { iso: "EG", name: "Egypt" }, { iso: "SV", name: "El Salvador" }, { iso: "GQ", name: "Equatorial Guinea" }, { iso: "ER", name: "Eritrea" }, { iso: "EE", name: "Estonia" }, { iso: "ET", name: "Ethiopia" }, { iso: "FK", name: "Falkland Islands" }, { iso: "FO", name: "Faroe Islands" }, { iso: "FJ", name: "Fiji" }, { iso: "FI", name: "Finland" }, { iso: "FR", name: "France" }, { iso: "GF", name: "French Guiana" }, { iso: "PF", name: "French Polynesia" }, { iso: "TF", name: "French Southern Territories" }, { iso: "GA", name: "Gabon" }, { iso: "GM", name: "Gambia" }, { iso: "GE", name: "Georgia" }, { iso: "DE", name: "Germany" }, { iso: "GH", name: "Ghana" }, { iso: "GI", name: "Gibraltar" }, { iso: "GR", name: "Greece" }, { iso: "GL", name: "Greenland" }, { iso: "GD", name: "Grenada" }, { iso: "GP", name: "Guadeloupe" }, { iso: "GU", name: "Guam" }, { iso: "GT", name: "Guatemala" }, { iso: "GG", name: "Guernsey" }, { iso: "GN", name: "Guinea" }, { iso: "GW", name: "Guinea-Bissau" }, { iso: "GY", name: "Guyana" }, { iso: "HT", name: "Haiti" }, { iso: "HM", name: "Heard Island and McDonald Islands" }, { iso: "HN", name: "Honduras" }, { iso: "HK", name: "Hong Kong" }, { iso: "HU", name: "Hungary" }, { iso: "IS", name: "Iceland" }, { iso: "IN", name: "India" }, { iso: "ID", name: "Indonesia" }, { iso: "IR", name: "Iran" }, { iso: "IQ", name: "Iraq" }, { iso: "IE", name: "Ireland" }, { iso: "IM", name: "Isle of Man" }, { iso: "IL", name: "Israel" }, { iso: "IT", name: "Italy" }, { iso: "CI", name: "Ivory Coast" }, { iso: "JM", name: "Jamaica" }, { iso: "JP", name: "Japan" }, { iso: "JE", name: "Jersey" }, { iso: "JO", name: "Jordan" }, { iso: "KZ", name: "Kazakhstan" }, { iso: "KE", name: "Kenya" }, { iso: "KI", name: "Kiribati" }, { iso: "XK", name: "Kosovo" }, { iso: "KW", name: "Kuwait" }, { iso: "KG", name: "Kyrgyzstan" }, { iso: "LA", name: "Laos" }, { iso: "LV", name: "Latvia" }, { iso: "LB", name: "Lebanon" }, { iso: "LS", name: "Lesotho" }, { iso: "LR", name: "Liberia" }, { iso: "LY", name: "Libya" }, { iso: "LI", name: "Liechtenstein" }, { iso: "LT", name: "Lithuania" }, { iso: "LU", name: "Luxembourg" }, { iso: "MO", name: "Macao" }, { iso: "MK", name: "Macedonia" }, { iso: "MG", name: "Madagascar" }, { iso: "MW", name: "Malawi" }, { iso: "MY", name: "Malaysia" }, { iso: "MV", name: "Maldives" }, { iso: "ML", name: "Mali" }, { iso: "MT", name: "Malta" }, { iso: "MH", name: "Marshall Islands" }, { iso: "MQ", name: "Martinique" }, { iso: "MR", name: "Mauritania" }, { iso: "MU", name: "Mauritius" }, { iso: "YT", name: "Mayotte" }, { iso: "MX", name: "Mexico" }, { iso: "FM", name: "Micronesia" }, { iso: "MD", name: "Moldova" }, { iso: "MC", name: "Monaco" }, { iso: "MN", name: "Mongolia" }, { iso: "ME", name: "Montenegro" }, { iso: "MS", name: "Montserrat" }, { iso: "MA", name: "Morocco" }, { iso: "MZ", name: "Mozambique" }, { iso: "MM", name: "Myanmar [Burma]" }, { iso: "NA", name: "Namibia" }, { iso: "NR", name: "Nauru" }, { iso: "NP", name: "Nepal" }, { iso: "NL", name: "Netherlands" }, { iso: "AN", name: "Netherlands Antilles" }, { iso: "NC", name: "New Caledonia" }, { iso: "NZ", name: "New Zealand" }, { iso: "NI", name: "Nicaragua" }, { iso: "NE", name: "Niger" }, { iso: "NG", name: "Nigeria" }, { iso: "NU", name: "Niue" }, { iso: "NF", name: "Norfolk Island" }, { iso: "KP", name: "North Korea" }, { iso: "MP", name: "Northern Mariana Islands" }, { iso: "NO", name: "Norway" }, { iso: "OM", name: "Oman" }, { iso: "PK", name: "Pakistan" }, { iso: "PW", name: "Palau" }, { iso: "PS", name: "Palestine" }, { iso: "PA", name: "Panama" }, { iso: "PG", name: "Papua New Guinea" }, { iso: "PY", name: "Paraguay" }, { iso: "PE", name: "Peru" }, { iso: "PH", name: "Philippines" }, { iso: "PN", name: "Pitcairn Islands" }, { iso: "PL", name: "Poland" }, { iso: "PT", name: "Portugal" }, { iso: "PR", name: "Puerto Rico" }, { iso: "QA", name: "Qatar" }, { iso: "CG", name: "Republic of the Congo" }, { iso: "RE", name: "Réunion" }, { iso: "RO", name: "Romania" }, { iso: "RU", name: "Russia" }, { iso: "RW", name: "Rwanda" }, { iso: "BL", name: "Saint Barthélemy" }, { iso: "SH", name: "Saint Helena" }, { iso: "KN", name: "Saint Kitts and Nevis" }, { iso: "LC", name: "Saint Lucia" }, { iso: "MF", name: "Saint Martin" }, { iso: "PM", name: "Saint Pierre and Miquelon" }, { iso: "VC", name: "Saint Vincent and the Grenadines" }, { iso: "WS", name: "Samoa" }, { iso: "SM", name: "San Marino" }, { iso: "ST", name: "São Tomé and Príncipe" }, { iso: "SA", name: "Saudi Arabia" }, { iso: "SN", name: "Senegal" }, { iso: "RS", name: "Serbia" }, { iso: "CS", name: "Serbia and Montenegro" }, { iso: "SC", name: "Seychelles" }, { iso: "SL", name: "Sierra Leone" }, { iso: "SG", name: "Singapore" }, { iso: "SX", name: "Sint Maarten" }, { iso: "SK", name: "Slovakia" }, { iso: "SI", name: "Slovenia" }, { iso: "SB", name: "Solomon Islands" }, { iso: "SO", name: "Somalia" }, { iso: "ZA", name: "South Africa" }, { iso: "GS", name: "South Georgia and the South Sandwich Islands" }, { iso: "KR", name: "South Korea" }, { iso: "SS", name: "South Sudan" }, { iso: "ES", name: "Spain" }, { iso: "LK", name: "Sri Lanka" }, { iso: "SD", name: "Sudan" }, { iso: "SR", name: "Suriname" }, { iso: "SJ", name: "Svalbard and Jan Mayen" }, { iso: "SZ", name: "Swaziland" }, { iso: "SE", name: "Sweden" }, { iso: "CH", name: "Switzerland" }, { iso: "SY", name: "Syria" }, { iso: "TW", name: "Taiwan" }, { iso: "TJ", name: "Tajikistan" }, { iso: "TZ", name: "Tanzania" }, { iso: "TH", name: "Thailand" }, { iso: "TG", name: "Togo" }, { iso: "TK", name: "Tokelau" }, { iso: "TO", name: "Tonga" }, { iso: "TT", name: "Trinidad and Tobago" }, { iso: "TN", name: "Tunisia" }, { iso: "TR", name: "Turkey" }, { iso: "TM", name: "Turkmenistan" }, { iso: "TC", name: "Turks and Caicos Islands" }, { iso: "TV", name: "Tuvalu" }, { iso: "UM", name: "U.S. Minor Outlying Islands" }, { iso: "VI", name: "U.S. Virgin Islands" }, { iso: "UG", name: "Uganda" }, { iso: "UA", name: "Ukraine" }, { iso: "AE", name: "United Arab Emirates" }, { iso: "GB", name: "United Kingdom" }, { iso: "US", name: "United States" }, { iso: "UY", name: "Uruguay" }, { iso: "UZ", name: "Uzbekistan" }, { iso: "VU", name: "Vanuatu" }, { iso: "VA", name: "Vatican City" }, { iso: "VE", name: "Venezuela" }, { iso: "VN", name: "Vietnam" }, { iso: "WF", name: "Wallis and Futuna" }, { iso: "EH", name: "Western Sahara" }, { iso: "YE", name: "Yemen" }, { iso: "ZM", name: "Zambia" }, { iso: "ZW", name: "Zimbabwe" }];

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.LineChart = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //  weak

	var _d = __webpack_require__(5);

	var d3 = _interopRequireWildcard(_d);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var LineChart = exports.LineChart = function () {
	  function LineChart(parentContainer, type) {
	    _classCallCheck(this, LineChart);

	    this.data = [];
	    this.type = type;
	    this.createElements(parentContainer);
	  }

	  _createClass(LineChart, [{
	    key: 'hide',
	    value: function hide() {
	      this.svg.classed('hidden-chart', !this.svg.classed('hidden-chart'));
	    }
	  }, {
	    key: 'updateData',
	    value: function updateData(data) {
	      this.data = data;
	      this.updateElements();
	    }
	  }, {
	    key: 'createElements',
	    value: function createElements(_parentContainer) {
	      var parentContainer = d3.select(_parentContainer);
	      var data = this.data;


	      var margin = { top: 10, right: 0, bottom: 30, left: 30 };
	      var width = 800;
	      var height = 400;
	      var obj = {};
	      this.x = d3.scaleTime().range([0, width]);
	      this.y = d3.scaleLinear().range([height, 0]);

	      var x = this.x,
	          y = this.y;

	      this.xAxis = d3.axisBottom(x);

	      // Displaying months for seasonal chart
	      if (this.type == 'seasonal') {
	        this.xAxis = this.xAxis.tickFormat(d3.timeFormat("%b"));
	      }

	      this.yAxis = d3.axisLeft(y);

	      this.line = d3.line().x(function (d) {
	        return x(d.date);
	      }).y(function (d) {
	        return y(d.value);
	      });

	      this.svg = parentContainer.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).classed('chart', true);

	      var chart = this.svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	      this.x.domain(d3.extent(data, function (d) {
	        return d.date;
	      }));
	      this.y.domain(d3.extent(data, function (d) {
	        return d.value;
	      }));

	      chart.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(this.xAxis);

	      chart.append('g').attr('class', 'y axis').call(this.yAxis);

	      chart.append('path').datum(data).attr('class', 'line').attr('stroke', 'black').attr('d', this.line);
	    }
	  }, {
	    key: 'updateElements',
	    value: function updateElements() {
	      var data = this.data;
	      var svg = this.svg,
	          x = this.x,
	          y = this.y,
	          xAxis = this.xAxis,
	          yAxis = this.yAxis,
	          line = this.line;


	      x.domain(d3.extent(data, function (d) {
	        return d.date;
	      }));
	      y.domain(d3.extent(data, function (d) {
	        return d.value;
	      }));

	      svg.select('g.y').transition().duration(1000).call(yAxis);

	      svg.select('g.x').transition().duration(1000).call(xAxis);

	      svg.selectAll('path.line').datum(data).transition().duration(1000).attr('d', line);
	    }
	  }]);

	  return LineChart;
	}();

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	// https://d3js.org Version 4.8.0. Copyright 2017 Mike Bostock.
	(function (global, factory) {
		 true ? factory(exports) :
		typeof define === 'function' && define.amd ? define(['exports'], factory) :
		(factory((global.d3 = global.d3 || {})));
	}(this, (function (exports) { 'use strict';

	var version = "4.8.0";

	var ascending = function(a, b) {
	  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	};

	var bisector = function(compare) {
	  if (compare.length === 1) compare = ascendingComparator(compare);
	  return {
	    left: function(a, x, lo, hi) {
	      if (lo == null) lo = 0;
	      if (hi == null) hi = a.length;
	      while (lo < hi) {
	        var mid = lo + hi >>> 1;
	        if (compare(a[mid], x) < 0) lo = mid + 1;
	        else hi = mid;
	      }
	      return lo;
	    },
	    right: function(a, x, lo, hi) {
	      if (lo == null) lo = 0;
	      if (hi == null) hi = a.length;
	      while (lo < hi) {
	        var mid = lo + hi >>> 1;
	        if (compare(a[mid], x) > 0) hi = mid;
	        else lo = mid + 1;
	      }
	      return lo;
	    }
	  };
	};

	function ascendingComparator(f) {
	  return function(d, x) {
	    return ascending(f(d), x);
	  };
	}

	var ascendingBisect = bisector(ascending);
	var bisectRight = ascendingBisect.right;
	var bisectLeft = ascendingBisect.left;

	var pairs = function(array, f) {
	  if (f == null) f = pair;
	  var i = 0, n = array.length - 1, p = array[0], pairs = new Array(n < 0 ? 0 : n);
	  while (i < n) pairs[i] = f(p, p = array[++i]);
	  return pairs;
	};

	function pair(a, b) {
	  return [a, b];
	}

	var cross = function(values0, values1, reduce) {
	  var n0 = values0.length,
	      n1 = values1.length,
	      values = new Array(n0 * n1),
	      i0,
	      i1,
	      i,
	      value0;

	  if (reduce == null) reduce = pair;

	  for (i0 = i = 0; i0 < n0; ++i0) {
	    for (value0 = values0[i0], i1 = 0; i1 < n1; ++i1, ++i) {
	      values[i] = reduce(value0, values1[i1]);
	    }
	  }

	  return values;
	};

	var descending = function(a, b) {
	  return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
	};

	var number = function(x) {
	  return x === null ? NaN : +x;
	};

	var variance = function(values, valueof) {
	  var n = values.length,
	      m = 0,
	      i = -1,
	      mean = 0,
	      value,
	      delta,
	      sum = 0;

	  if (valueof == null) {
	    while (++i < n) {
	      if (!isNaN(value = number(values[i]))) {
	        delta = value - mean;
	        mean += delta / ++m;
	        sum += delta * (value - mean);
	      }
	    }
	  }

	  else {
	    while (++i < n) {
	      if (!isNaN(value = number(valueof(values[i], i, values)))) {
	        delta = value - mean;
	        mean += delta / ++m;
	        sum += delta * (value - mean);
	      }
	    }
	  }

	  if (m > 1) return sum / (m - 1);
	};

	var deviation = function(array, f) {
	  var v = variance(array, f);
	  return v ? Math.sqrt(v) : v;
	};

	var extent = function(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      min,
	      max;

	  if (valueof == null) {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = values[i]) != null && value >= value) {
	        min = max = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = values[i]) != null) {
	            if (min > value) min = value;
	            if (max < value) max = value;
	          }
	        }
	      }
	    }
	  }

	  else {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = valueof(values[i], i, values)) != null && value >= value) {
	        min = max = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = valueof(values[i], i, values)) != null) {
	            if (min > value) min = value;
	            if (max < value) max = value;
	          }
	        }
	      }
	    }
	  }

	  return [min, max];
	};

	var array = Array.prototype;

	var slice = array.slice;
	var map = array.map;

	var constant = function(x) {
	  return function() {
	    return x;
	  };
	};

	var identity = function(x) {
	  return x;
	};

	var sequence = function(start, stop, step) {
	  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

	  var i = -1,
	      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
	      range = new Array(n);

	  while (++i < n) {
	    range[i] = start + i * step;
	  }

	  return range;
	};

	var e10 = Math.sqrt(50);
	var e5 = Math.sqrt(10);
	var e2 = Math.sqrt(2);

	var ticks = function(start, stop, count) {
	  var reverse = stop < start,
	      i = -1,
	      n,
	      ticks,
	      step;

	  if (reverse) n = start, start = stop, stop = n;

	  if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

	  if (step > 0) {
	    start = Math.ceil(start / step);
	    stop = Math.floor(stop / step);
	    ticks = new Array(n = Math.ceil(stop - start + 1));
	    while (++i < n) ticks[i] = (start + i) * step;
	  } else {
	    start = Math.floor(start * step);
	    stop = Math.ceil(stop * step);
	    ticks = new Array(n = Math.ceil(start - stop + 1));
	    while (++i < n) ticks[i] = (start - i) / step;
	  }

	  if (reverse) ticks.reverse();

	  return ticks;
	};

	function tickIncrement(start, stop, count) {
	  var step = (stop - start) / Math.max(0, count),
	      power = Math.floor(Math.log(step) / Math.LN10),
	      error = step / Math.pow(10, power);
	  return power >= 0
	      ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
	      : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
	}

	function tickStep(start, stop, count) {
	  var step0 = Math.abs(stop - start) / Math.max(0, count),
	      step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
	      error = step0 / step1;
	  if (error >= e10) step1 *= 10;
	  else if (error >= e5) step1 *= 5;
	  else if (error >= e2) step1 *= 2;
	  return stop < start ? -step1 : step1;
	}

	var sturges = function(values) {
	  return Math.ceil(Math.log(values.length) / Math.LN2) + 1;
	};

	var histogram = function() {
	  var value = identity,
	      domain = extent,
	      threshold = sturges;

	  function histogram(data) {
	    var i,
	        n = data.length,
	        x,
	        values = new Array(n);

	    for (i = 0; i < n; ++i) {
	      values[i] = value(data[i], i, data);
	    }

	    var xz = domain(values),
	        x0 = xz[0],
	        x1 = xz[1],
	        tz = threshold(values, x0, x1);

	    // Convert number of thresholds into uniform thresholds.
	    if (!Array.isArray(tz)) {
	      tz = tickStep(x0, x1, tz);
	      tz = sequence(Math.ceil(x0 / tz) * tz, Math.floor(x1 / tz) * tz, tz); // exclusive
	    }

	    // Remove any thresholds outside the domain.
	    var m = tz.length;
	    while (tz[0] <= x0) tz.shift(), --m;
	    while (tz[m - 1] > x1) tz.pop(), --m;

	    var bins = new Array(m + 1),
	        bin;

	    // Initialize bins.
	    for (i = 0; i <= m; ++i) {
	      bin = bins[i] = [];
	      bin.x0 = i > 0 ? tz[i - 1] : x0;
	      bin.x1 = i < m ? tz[i] : x1;
	    }

	    // Assign data to bins by value, ignoring any outside the domain.
	    for (i = 0; i < n; ++i) {
	      x = values[i];
	      if (x0 <= x && x <= x1) {
	        bins[bisectRight(tz, x, 0, m)].push(data[i]);
	      }
	    }

	    return bins;
	  }

	  histogram.value = function(_) {
	    return arguments.length ? (value = typeof _ === "function" ? _ : constant(_), histogram) : value;
	  };

	  histogram.domain = function(_) {
	    return arguments.length ? (domain = typeof _ === "function" ? _ : constant([_[0], _[1]]), histogram) : domain;
	  };

	  histogram.thresholds = function(_) {
	    return arguments.length ? (threshold = typeof _ === "function" ? _ : Array.isArray(_) ? constant(slice.call(_)) : constant(_), histogram) : threshold;
	  };

	  return histogram;
	};

	var threshold = function(values, p, valueof) {
	  if (valueof == null) valueof = number;
	  if (!(n = values.length)) return;
	  if ((p = +p) <= 0 || n < 2) return +valueof(values[0], 0, values);
	  if (p >= 1) return +valueof(values[n - 1], n - 1, values);
	  var n,
	      i = (n - 1) * p,
	      i0 = Math.floor(i),
	      value0 = +valueof(values[i0], i0, values),
	      value1 = +valueof(values[i0 + 1], i0 + 1, values);
	  return value0 + (value1 - value0) * (i - i0);
	};

	var freedmanDiaconis = function(values, min, max) {
	  values = map.call(values, number).sort(ascending);
	  return Math.ceil((max - min) / (2 * (threshold(values, 0.75) - threshold(values, 0.25)) * Math.pow(values.length, -1 / 3)));
	};

	var scott = function(values, min, max) {
	  return Math.ceil((max - min) / (3.5 * deviation(values) * Math.pow(values.length, -1 / 3)));
	};

	var max = function(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      max;

	  if (valueof == null) {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = values[i]) != null && value >= value) {
	        max = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = values[i]) != null && value > max) {
	            max = value;
	          }
	        }
	      }
	    }
	  }

	  else {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = valueof(values[i], i, values)) != null && value >= value) {
	        max = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = valueof(values[i], i, values)) != null && value > max) {
	            max = value;
	          }
	        }
	      }
	    }
	  }

	  return max;
	};

	var mean = function(values, valueof) {
	  var n = values.length,
	      m = n,
	      i = -1,
	      value,
	      sum = 0;

	  if (valueof == null) {
	    while (++i < n) {
	      if (!isNaN(value = number(values[i]))) sum += value;
	      else --m;
	    }
	  }

	  else {
	    while (++i < n) {
	      if (!isNaN(value = number(valueof(values[i], i, values)))) sum += value;
	      else --m;
	    }
	  }

	  if (m) return sum / m;
	};

	var median = function(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      numbers = [];

	  if (valueof == null) {
	    while (++i < n) {
	      if (!isNaN(value = number(values[i]))) {
	        numbers.push(value);
	      }
	    }
	  }

	  else {
	    while (++i < n) {
	      if (!isNaN(value = number(valueof(values[i], i, values)))) {
	        numbers.push(value);
	      }
	    }
	  }

	  return threshold(numbers.sort(ascending), 0.5);
	};

	var merge = function(arrays) {
	  var n = arrays.length,
	      m,
	      i = -1,
	      j = 0,
	      merged,
	      array;

	  while (++i < n) j += arrays[i].length;
	  merged = new Array(j);

	  while (--n >= 0) {
	    array = arrays[n];
	    m = array.length;
	    while (--m >= 0) {
	      merged[--j] = array[m];
	    }
	  }

	  return merged;
	};

	var min = function(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      min;

	  if (valueof == null) {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = values[i]) != null && value >= value) {
	        min = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = values[i]) != null && min > value) {
	            min = value;
	          }
	        }
	      }
	    }
	  }

	  else {
	    while (++i < n) { // Find the first comparable value.
	      if ((value = valueof(values[i], i, values)) != null && value >= value) {
	        min = value;
	        while (++i < n) { // Compare the remaining values.
	          if ((value = valueof(values[i], i, values)) != null && min > value) {
	            min = value;
	          }
	        }
	      }
	    }
	  }

	  return min;
	};

	var permute = function(array, indexes) {
	  var i = indexes.length, permutes = new Array(i);
	  while (i--) permutes[i] = array[indexes[i]];
	  return permutes;
	};

	var scan = function(values, compare) {
	  if (!(n = values.length)) return;
	  var n,
	      i = 0,
	      j = 0,
	      xi,
	      xj = values[j];

	  if (compare == null) compare = ascending;

	  while (++i < n) {
	    if (compare(xi = values[i], xj) < 0 || compare(xj, xj) !== 0) {
	      xj = xi, j = i;
	    }
	  }

	  if (compare(xj, xj) === 0) return j;
	};

	var shuffle = function(array, i0, i1) {
	  var m = (i1 == null ? array.length : i1) - (i0 = i0 == null ? 0 : +i0),
	      t,
	      i;

	  while (m) {
	    i = Math.random() * m-- | 0;
	    t = array[m + i0];
	    array[m + i0] = array[i + i0];
	    array[i + i0] = t;
	  }

	  return array;
	};

	var sum = function(values, valueof) {
	  var n = values.length,
	      i = -1,
	      value,
	      sum = 0;

	  if (valueof == null) {
	    while (++i < n) {
	      if (value = +values[i]) sum += value; // Note: zero and null are equivalent.
	    }
	  }

	  else {
	    while (++i < n) {
	      if (value = +valueof(values[i], i, values)) sum += value;
	    }
	  }

	  return sum;
	};

	var transpose = function(matrix) {
	  if (!(n = matrix.length)) return [];
	  for (var i = -1, m = min(matrix, length), transpose = new Array(m); ++i < m;) {
	    for (var j = -1, n, row = transpose[i] = new Array(n); ++j < n;) {
	      row[j] = matrix[j][i];
	    }
	  }
	  return transpose;
	};

	function length(d) {
	  return d.length;
	}

	var zip = function() {
	  return transpose(arguments);
	};

	var slice$1 = Array.prototype.slice;

	var identity$1 = function(x) {
	  return x;
	};

	var top = 1;
	var right = 2;
	var bottom = 3;
	var left = 4;
	var epsilon = 1e-6;

	function translateX(x) {
	  return "translate(" + x + ",0)";
	}

	function translateY(y) {
	  return "translate(0," + y + ")";
	}

	function center(scale) {
	  var offset = scale.bandwidth() / 2;
	  if (scale.round()) offset = Math.round(offset);
	  return function(d) {
	    return scale(d) + offset;
	  };
	}

	function entering() {
	  return !this.__axis;
	}

	function axis(orient, scale) {
	  var tickArguments = [],
	      tickValues = null,
	      tickFormat = null,
	      tickSizeInner = 6,
	      tickSizeOuter = 6,
	      tickPadding = 3,
	      k = orient === top || orient === left ? -1 : 1,
	      x, y = orient === left || orient === right ? (x = "x", "y") : (x = "y", "x"),
	      transform = orient === top || orient === bottom ? translateX : translateY;

	  function axis(context) {
	    var values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues,
	        format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity$1) : tickFormat,
	        spacing = Math.max(tickSizeInner, 0) + tickPadding,
	        range = scale.range(),
	        range0 = range[0] + 0.5,
	        range1 = range[range.length - 1] + 0.5,
	        position = (scale.bandwidth ? center : identity$1)(scale.copy()),
	        selection = context.selection ? context.selection() : context,
	        path = selection.selectAll(".domain").data([null]),
	        tick = selection.selectAll(".tick").data(values, scale).order(),
	        tickExit = tick.exit(),
	        tickEnter = tick.enter().append("g").attr("class", "tick"),
	        line = tick.select("line"),
	        text = tick.select("text");

	    path = path.merge(path.enter().insert("path", ".tick")
	        .attr("class", "domain")
	        .attr("stroke", "#000"));

	    tick = tick.merge(tickEnter);

	    line = line.merge(tickEnter.append("line")
	        .attr("stroke", "#000")
	        .attr(x + "2", k * tickSizeInner)
	        .attr(y + "1", 0.5)
	        .attr(y + "2", 0.5));

	    text = text.merge(tickEnter.append("text")
	        .attr("fill", "#000")
	        .attr(x, k * spacing)
	        .attr(y, 0.5)
	        .attr("dy", orient === top ? "0em" : orient === bottom ? "0.71em" : "0.32em"));

	    if (context !== selection) {
	      path = path.transition(context);
	      tick = tick.transition(context);
	      line = line.transition(context);
	      text = text.transition(context);

	      tickExit = tickExit.transition(context)
	          .attr("opacity", epsilon)
	          .attr("transform", function(d) { return isFinite(d = position(d)) ? transform(d) : this.getAttribute("transform"); });

	      tickEnter
	          .attr("opacity", epsilon)
	          .attr("transform", function(d) { var p = this.parentNode.__axis; return transform(p && isFinite(p = p(d)) ? p : position(d)); });
	    }

	    tickExit.remove();

	    path
	        .attr("d", orient === left || orient == right
	            ? "M" + k * tickSizeOuter + "," + range0 + "H0.5V" + range1 + "H" + k * tickSizeOuter
	            : "M" + range0 + "," + k * tickSizeOuter + "V0.5H" + range1 + "V" + k * tickSizeOuter);

	    tick
	        .attr("opacity", 1)
	        .attr("transform", function(d) { return transform(position(d)); });

	    line
	        .attr(x + "2", k * tickSizeInner);

	    text
	        .attr(x, k * spacing)
	        .text(format);

	    selection.filter(entering)
	        .attr("fill", "none")
	        .attr("font-size", 10)
	        .attr("font-family", "sans-serif")
	        .attr("text-anchor", orient === right ? "start" : orient === left ? "end" : "middle");

	    selection
	        .each(function() { this.__axis = position; });
	  }

	  axis.scale = function(_) {
	    return arguments.length ? (scale = _, axis) : scale;
	  };

	  axis.ticks = function() {
	    return tickArguments = slice$1.call(arguments), axis;
	  };

	  axis.tickArguments = function(_) {
	    return arguments.length ? (tickArguments = _ == null ? [] : slice$1.call(_), axis) : tickArguments.slice();
	  };

	  axis.tickValues = function(_) {
	    return arguments.length ? (tickValues = _ == null ? null : slice$1.call(_), axis) : tickValues && tickValues.slice();
	  };

	  axis.tickFormat = function(_) {
	    return arguments.length ? (tickFormat = _, axis) : tickFormat;
	  };

	  axis.tickSize = function(_) {
	    return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis) : tickSizeInner;
	  };

	  axis.tickSizeInner = function(_) {
	    return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
	  };

	  axis.tickSizeOuter = function(_) {
	    return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
	  };

	  axis.tickPadding = function(_) {
	    return arguments.length ? (tickPadding = +_, axis) : tickPadding;
	  };

	  return axis;
	}

	function axisTop(scale) {
	  return axis(top, scale);
	}

	function axisRight(scale) {
	  return axis(right, scale);
	}

	function axisBottom(scale) {
	  return axis(bottom, scale);
	}

	function axisLeft(scale) {
	  return axis(left, scale);
	}

	var noop = {value: function() {}};

	function dispatch() {
	  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
	    if (!(t = arguments[i] + "") || (t in _)) throw new Error("illegal type: " + t);
	    _[t] = [];
	  }
	  return new Dispatch(_);
	}

	function Dispatch(_) {
	  this._ = _;
	}

	function parseTypenames(typenames, types) {
	  return typenames.trim().split(/^|\s+/).map(function(t) {
	    var name = "", i = t.indexOf(".");
	    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
	    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
	    return {type: t, name: name};
	  });
	}

	Dispatch.prototype = dispatch.prototype = {
	  constructor: Dispatch,
	  on: function(typename, callback) {
	    var _ = this._,
	        T = parseTypenames(typename + "", _),
	        t,
	        i = -1,
	        n = T.length;

	    // If no callback was specified, return the callback of the given type and name.
	    if (arguments.length < 2) {
	      while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
	      return;
	    }

	    // If a type was specified, set the callback for the given type and name.
	    // Otherwise, if a null callback was specified, remove callbacks of the given name.
	    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
	    while (++i < n) {
	      if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
	      else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
	    }

	    return this;
	  },
	  copy: function() {
	    var copy = {}, _ = this._;
	    for (var t in _) copy[t] = _[t].slice();
	    return new Dispatch(copy);
	  },
	  call: function(type, that) {
	    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
	    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
	    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
	  },
	  apply: function(type, that, args) {
	    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
	    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
	  }
	};

	function get(type, name) {
	  for (var i = 0, n = type.length, c; i < n; ++i) {
	    if ((c = type[i]).name === name) {
	      return c.value;
	    }
	  }
	}

	function set(type, name, callback) {
	  for (var i = 0, n = type.length; i < n; ++i) {
	    if (type[i].name === name) {
	      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
	      break;
	    }
	  }
	  if (callback != null) type.push({name: name, value: callback});
	  return type;
	}

	var xhtml = "http://www.w3.org/1999/xhtml";

	var namespaces = {
	  svg: "http://www.w3.org/2000/svg",
	  xhtml: xhtml,
	  xlink: "http://www.w3.org/1999/xlink",
	  xml: "http://www.w3.org/XML/1998/namespace",
	  xmlns: "http://www.w3.org/2000/xmlns/"
	};

	var namespace = function(name) {
	  var prefix = name += "", i = prefix.indexOf(":");
	  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
	  return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name;
	};

	function creatorInherit(name) {
	  return function() {
	    var document = this.ownerDocument,
	        uri = this.namespaceURI;
	    return uri === xhtml && document.documentElement.namespaceURI === xhtml
	        ? document.createElement(name)
	        : document.createElementNS(uri, name);
	  };
	}

	function creatorFixed(fullname) {
	  return function() {
	    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
	  };
	}

	var creator = function(name) {
	  var fullname = namespace(name);
	  return (fullname.local
	      ? creatorFixed
	      : creatorInherit)(fullname);
	};

	var nextId = 0;

	function local$1() {
	  return new Local;
	}

	function Local() {
	  this._ = "@" + (++nextId).toString(36);
	}

	Local.prototype = local$1.prototype = {
	  constructor: Local,
	  get: function(node) {
	    var id = this._;
	    while (!(id in node)) if (!(node = node.parentNode)) return;
	    return node[id];
	  },
	  set: function(node, value) {
	    return node[this._] = value;
	  },
	  remove: function(node) {
	    return this._ in node && delete node[this._];
	  },
	  toString: function() {
	    return this._;
	  }
	};

	var matcher = function(selector) {
	  return function() {
	    return this.matches(selector);
	  };
	};

	if (typeof document !== "undefined") {
	  var element = document.documentElement;
	  if (!element.matches) {
	    var vendorMatches = element.webkitMatchesSelector
	        || element.msMatchesSelector
	        || element.mozMatchesSelector
	        || element.oMatchesSelector;
	    matcher = function(selector) {
	      return function() {
	        return vendorMatches.call(this, selector);
	      };
	    };
	  }
	}

	var matcher$1 = matcher;

	var filterEvents = {};

	exports.event = null;

	if (typeof document !== "undefined") {
	  var element$1 = document.documentElement;
	  if (!("onmouseenter" in element$1)) {
	    filterEvents = {mouseenter: "mouseover", mouseleave: "mouseout"};
	  }
	}

	function filterContextListener(listener, index, group) {
	  listener = contextListener(listener, index, group);
	  return function(event) {
	    var related = event.relatedTarget;
	    if (!related || (related !== this && !(related.compareDocumentPosition(this) & 8))) {
	      listener.call(this, event);
	    }
	  };
	}

	function contextListener(listener, index, group) {
	  return function(event1) {
	    var event0 = exports.event; // Events can be reentrant (e.g., focus).
	    exports.event = event1;
	    try {
	      listener.call(this, this.__data__, index, group);
	    } finally {
	      exports.event = event0;
	    }
	  };
	}

	function parseTypenames$1(typenames) {
	  return typenames.trim().split(/^|\s+/).map(function(t) {
	    var name = "", i = t.indexOf(".");
	    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
	    return {type: t, name: name};
	  });
	}

	function onRemove(typename) {
	  return function() {
	    var on = this.__on;
	    if (!on) return;
	    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
	      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
	        this.removeEventListener(o.type, o.listener, o.capture);
	      } else {
	        on[++i] = o;
	      }
	    }
	    if (++i) on.length = i;
	    else delete this.__on;
	  };
	}

	function onAdd(typename, value, capture) {
	  var wrap = filterEvents.hasOwnProperty(typename.type) ? filterContextListener : contextListener;
	  return function(d, i, group) {
	    var on = this.__on, o, listener = wrap(value, i, group);
	    if (on) for (var j = 0, m = on.length; j < m; ++j) {
	      if ((o = on[j]).type === typename.type && o.name === typename.name) {
	        this.removeEventListener(o.type, o.listener, o.capture);
	        this.addEventListener(o.type, o.listener = listener, o.capture = capture);
	        o.value = value;
	        return;
	      }
	    }
	    this.addEventListener(typename.type, listener, capture);
	    o = {type: typename.type, name: typename.name, value: value, listener: listener, capture: capture};
	    if (!on) this.__on = [o];
	    else on.push(o);
	  };
	}

	var selection_on = function(typename, value, capture) {
	  var typenames = parseTypenames$1(typename + ""), i, n = typenames.length, t;

	  if (arguments.length < 2) {
	    var on = this.node().__on;
	    if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
	      for (i = 0, o = on[j]; i < n; ++i) {
	        if ((t = typenames[i]).type === o.type && t.name === o.name) {
	          return o.value;
	        }
	      }
	    }
	    return;
	  }

	  on = value ? onAdd : onRemove;
	  if (capture == null) capture = false;
	  for (i = 0; i < n; ++i) this.each(on(typenames[i], value, capture));
	  return this;
	};

	function customEvent(event1, listener, that, args) {
	  var event0 = exports.event;
	  event1.sourceEvent = exports.event;
	  exports.event = event1;
	  try {
	    return listener.apply(that, args);
	  } finally {
	    exports.event = event0;
	  }
	}

	var sourceEvent = function() {
	  var current = exports.event, source;
	  while (source = current.sourceEvent) current = source;
	  return current;
	};

	var point = function(node, event) {
	  var svg = node.ownerSVGElement || node;

	  if (svg.createSVGPoint) {
	    var point = svg.createSVGPoint();
	    point.x = event.clientX, point.y = event.clientY;
	    point = point.matrixTransform(node.getScreenCTM().inverse());
	    return [point.x, point.y];
	  }

	  var rect = node.getBoundingClientRect();
	  return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
	};

	var mouse = function(node) {
	  var event = sourceEvent();
	  if (event.changedTouches) event = event.changedTouches[0];
	  return point(node, event);
	};

	function none() {}

	var selector = function(selector) {
	  return selector == null ? none : function() {
	    return this.querySelector(selector);
	  };
	};

	var selection_select = function(select) {
	  if (typeof select !== "function") select = selector(select);

	  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
	    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
	      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
	        if ("__data__" in node) subnode.__data__ = node.__data__;
	        subgroup[i] = subnode;
	      }
	    }
	  }

	  return new Selection(subgroups, this._parents);
	};

	function empty$1() {
	  return [];
	}

	var selectorAll = function(selector) {
	  return selector == null ? empty$1 : function() {
	    return this.querySelectorAll(selector);
	  };
	};

	var selection_selectAll = function(select) {
	  if (typeof select !== "function") select = selectorAll(select);

	  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
	    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
	      if (node = group[i]) {
	        subgroups.push(select.call(node, node.__data__, i, group));
	        parents.push(node);
	      }
	    }
	  }

	  return new Selection(subgroups, parents);
	};

	var selection_filter = function(match) {
	  if (typeof match !== "function") match = matcher$1(match);

	  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
	    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
	      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
	        subgroup.push(node);
	      }
	    }
	  }

	  return new Selection(subgroups, this._parents);
	};

	var sparse = function(update) {
	  return new Array(update.length);
	};

	var selection_enter = function() {
	  return new Selection(this._enter || this._groups.map(sparse), this._parents);
	};

	function EnterNode(parent, datum) {
	  this.ownerDocument = parent.ownerDocument;
	  this.namespaceURI = parent.namespaceURI;
	  this._next = null;
	  this._parent = parent;
	  this.__data__ = datum;
	}

	EnterNode.prototype = {
	  constructor: EnterNode,
	  appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
	  insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
	  querySelector: function(selector) { return this._parent.querySelector(selector); },
	  querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
	};

	var constant$1 = function(x) {
	  return function() {
	    return x;
	  };
	};

	var keyPrefix = "$"; // Protect against keys like “__proto__”.

	function bindIndex(parent, group, enter, update, exit, data) {
	  var i = 0,
	      node,
	      groupLength = group.length,
	      dataLength = data.length;

	  // Put any non-null nodes that fit into update.
	  // Put any null nodes into enter.
	  // Put any remaining data into enter.
	  for (; i < dataLength; ++i) {
	    if (node = group[i]) {
	      node.__data__ = data[i];
	      update[i] = node;
	    } else {
	      enter[i] = new EnterNode(parent, data[i]);
	    }
	  }

	  // Put any non-null nodes that don’t fit into exit.
	  for (; i < groupLength; ++i) {
	    if (node = group[i]) {
	      exit[i] = node;
	    }
	  }
	}

	function bindKey(parent, group, enter, update, exit, data, key) {
	  var i,
	      node,
	      nodeByKeyValue = {},
	      groupLength = group.length,
	      dataLength = data.length,
	      keyValues = new Array(groupLength),
	      keyValue;

	  // Compute the key for each node.
	  // If multiple nodes have the same key, the duplicates are added to exit.
	  for (i = 0; i < groupLength; ++i) {
	    if (node = group[i]) {
	      keyValues[i] = keyValue = keyPrefix + key.call(node, node.__data__, i, group);
	      if (keyValue in nodeByKeyValue) {
	        exit[i] = node;
	      } else {
	        nodeByKeyValue[keyValue] = node;
	      }
	    }
	  }

	  // Compute the key for each datum.
	  // If there a node associated with this key, join and add it to update.
	  // If there is not (or the key is a duplicate), add it to enter.
	  for (i = 0; i < dataLength; ++i) {
	    keyValue = keyPrefix + key.call(parent, data[i], i, data);
	    if (node = nodeByKeyValue[keyValue]) {
	      update[i] = node;
	      node.__data__ = data[i];
	      nodeByKeyValue[keyValue] = null;
	    } else {
	      enter[i] = new EnterNode(parent, data[i]);
	    }
	  }

	  // Add any remaining nodes that were not bound to data to exit.
	  for (i = 0; i < groupLength; ++i) {
	    if ((node = group[i]) && (nodeByKeyValue[keyValues[i]] === node)) {
	      exit[i] = node;
	    }
	  }
	}

	var selection_data = function(value, key) {
	  if (!value) {
	    data = new Array(this.size()), j = -1;
	    this.each(function(d) { data[++j] = d; });
	    return data;
	  }

	  var bind = key ? bindKey : bindIndex,
	      parents = this._parents,
	      groups = this._groups;

	  if (typeof value !== "function") value = constant$1(value);

	  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
	    var parent = parents[j],
	        group = groups[j],
	        groupLength = group.length,
	        data = value.call(parent, parent && parent.__data__, j, parents),
	        dataLength = data.length,
	        enterGroup = enter[j] = new Array(dataLength),
	        updateGroup = update[j] = new Array(dataLength),
	        exitGroup = exit[j] = new Array(groupLength);

	    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

	    // Now connect the enter nodes to their following update node, such that
	    // appendChild can insert the materialized enter node before this node,
	    // rather than at the end of the parent node.
	    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
	      if (previous = enterGroup[i0]) {
	        if (i0 >= i1) i1 = i0 + 1;
	        while (!(next = updateGroup[i1]) && ++i1 < dataLength);
	        previous._next = next || null;
	      }
	    }
	  }

	  update = new Selection(update, parents);
	  update._enter = enter;
	  update._exit = exit;
	  return update;
	};

	var selection_exit = function() {
	  return new Selection(this._exit || this._groups.map(sparse), this._parents);
	};

	var selection_merge = function(selection) {

	  for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
	    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
	      if (node = group0[i] || group1[i]) {
	        merge[i] = node;
	      }
	    }
	  }

	  for (; j < m0; ++j) {
	    merges[j] = groups0[j];
	  }

	  return new Selection(merges, this._parents);
	};

	var selection_order = function() {

	  for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
	    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
	      if (node = group[i]) {
	        if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
	        next = node;
	      }
	    }
	  }

	  return this;
	};

	var selection_sort = function(compare) {
	  if (!compare) compare = ascending$1;

	  function compareNode(a, b) {
	    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
	  }

	  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
	    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
	      if (node = group[i]) {
	        sortgroup[i] = node;
	      }
	    }
	    sortgroup.sort(compareNode);
	  }

	  return new Selection(sortgroups, this._parents).order();
	};

	function ascending$1(a, b) {
	  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	}

	var selection_call = function() {
	  var callback = arguments[0];
	  arguments[0] = this;
	  callback.apply(null, arguments);
	  return this;
	};

	var selection_nodes = function() {
	  var nodes = new Array(this.size()), i = -1;
	  this.each(function() { nodes[++i] = this; });
	  return nodes;
	};

	var selection_node = function() {

	  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
	    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
	      var node = group[i];
	      if (node) return node;
	    }
	  }

	  return null;
	};

	var selection_size = function() {
	  var size = 0;
	  this.each(function() { ++size; });
	  return size;
	};

	var selection_empty = function() {
	  return !this.node();
	};

	var selection_each = function(callback) {

	  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
	    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
	      if (node = group[i]) callback.call(node, node.__data__, i, group);
	    }
	  }

	  return this;
	};

	function attrRemove(name) {
	  return function() {
	    this.removeAttribute(name);
	  };
	}

	function attrRemoveNS(fullname) {
	  return function() {
	    this.removeAttributeNS(fullname.space, fullname.local);
	  };
	}

	function attrConstant(name, value) {
	  return function() {
	    this.setAttribute(name, value);
	  };
	}

	function attrConstantNS(fullname, value) {
	  return function() {
	    this.setAttributeNS(fullname.space, fullname.local, value);
	  };
	}

	function attrFunction(name, value) {
	  return function() {
	    var v = value.apply(this, arguments);
	    if (v == null) this.removeAttribute(name);
	    else this.setAttribute(name, v);
	  };
	}

	function attrFunctionNS(fullname, value) {
	  return function() {
	    var v = value.apply(this, arguments);
	    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
	    else this.setAttributeNS(fullname.space, fullname.local, v);
	  };
	}

	var selection_attr = function(name, value) {
	  var fullname = namespace(name);

	  if (arguments.length < 2) {
	    var node = this.node();
	    return fullname.local
	        ? node.getAttributeNS(fullname.space, fullname.local)
	        : node.getAttribute(fullname);
	  }

	  return this.each((value == null
	      ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
	      ? (fullname.local ? attrFunctionNS : attrFunction)
	      : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
	};

	var window = function(node) {
	  return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
	      || (node.document && node) // node is a Window
	      || node.defaultView; // node is a Document
	};

	function styleRemove(name) {
	  return function() {
	    this.style.removeProperty(name);
	  };
	}

	function styleConstant(name, value, priority) {
	  return function() {
	    this.style.setProperty(name, value, priority);
	  };
	}

	function styleFunction(name, value, priority) {
	  return function() {
	    var v = value.apply(this, arguments);
	    if (v == null) this.style.removeProperty(name);
	    else this.style.setProperty(name, v, priority);
	  };
	}

	var selection_style = function(name, value, priority) {
	  var node;
	  return arguments.length > 1
	      ? this.each((value == null
	            ? styleRemove : typeof value === "function"
	            ? styleFunction
	            : styleConstant)(name, value, priority == null ? "" : priority))
	      : window(node = this.node())
	          .getComputedStyle(node, null)
	          .getPropertyValue(name);
	};

	function propertyRemove(name) {
	  return function() {
	    delete this[name];
	  };
	}

	function propertyConstant(name, value) {
	  return function() {
	    this[name] = value;
	  };
	}

	function propertyFunction(name, value) {
	  return function() {
	    var v = value.apply(this, arguments);
	    if (v == null) delete this[name];
	    else this[name] = v;
	  };
	}

	var selection_property = function(name, value) {
	  return arguments.length > 1
	      ? this.each((value == null
	          ? propertyRemove : typeof value === "function"
	          ? propertyFunction
	          : propertyConstant)(name, value))
	      : this.node()[name];
	};

	function classArray(string) {
	  return string.trim().split(/^|\s+/);
	}

	function classList(node) {
	  return node.classList || new ClassList(node);
	}

	function ClassList(node) {
	  this._node = node;
	  this._names = classArray(node.getAttribute("class") || "");
	}

	ClassList.prototype = {
	  add: function(name) {
	    var i = this._names.indexOf(name);
	    if (i < 0) {
	      this._names.push(name);
	      this._node.setAttribute("class", this._names.join(" "));
	    }
	  },
	  remove: function(name) {
	    var i = this._names.indexOf(name);
	    if (i >= 0) {
	      this._names.splice(i, 1);
	      this._node.setAttribute("class", this._names.join(" "));
	    }
	  },
	  contains: function(name) {
	    return this._names.indexOf(name) >= 0;
	  }
	};

	function classedAdd(node, names) {
	  var list = classList(node), i = -1, n = names.length;
	  while (++i < n) list.add(names[i]);
	}

	function classedRemove(node, names) {
	  var list = classList(node), i = -1, n = names.length;
	  while (++i < n) list.remove(names[i]);
	}

	function classedTrue(names) {
	  return function() {
	    classedAdd(this, names);
	  };
	}

	function classedFalse(names) {
	  return function() {
	    classedRemove(this, names);
	  };
	}

	function classedFunction(names, value) {
	  return function() {
	    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
	  };
	}

	var selection_classed = function(name, value) {
	  var names = classArray(name + "");

	  if (arguments.length < 2) {
	    var list = classList(this.node()), i = -1, n = names.length;
	    while (++i < n) if (!list.contains(names[i])) return false;
	    return true;
	  }

	  return this.each((typeof value === "function"
	      ? classedFunction : value
	      ? classedTrue
	      : classedFalse)(names, value));
	};

	function textRemove() {
	  this.textContent = "";
	}

	function textConstant(value) {
	  return function() {
	    this.textContent = value;
	  };
	}

	function textFunction(value) {
	  return function() {
	    var v = value.apply(this, arguments);
	    this.textContent = v == null ? "" : v;
	  };
	}

	var selection_text = function(value) {
	  return arguments.length
	      ? this.each(value == null
	          ? textRemove : (typeof value === "function"
	          ? textFunction
	          : textConstant)(value))
	      : this.node().textContent;
	};

	function htmlRemove() {
	  this.innerHTML = "";
	}

	function htmlConstant(value) {
	  return function() {
	    this.innerHTML = value;
	  };
	}

	function htmlFunction(value) {
	  return function() {
	    var v = value.apply(this, arguments);
	    this.innerHTML = v == null ? "" : v;
	  };
	}

	var selection_html = function(value) {
	  return arguments.length
	      ? this.each(value == null
	          ? htmlRemove : (typeof value === "function"
	          ? htmlFunction
	          : htmlConstant)(value))
	      : this.node().innerHTML;
	};

	function raise() {
	  if (this.nextSibling) this.parentNode.appendChild(this);
	}

	var selection_raise = function() {
	  return this.each(raise);
	};

	function lower() {
	  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
	}

	var selection_lower = function() {
	  return this.each(lower);
	};

	var selection_append = function(name) {
	  var create = typeof name === "function" ? name : creator(name);
	  return this.select(function() {
	    return this.appendChild(create.apply(this, arguments));
	  });
	};

	function constantNull() {
	  return null;
	}

	var selection_insert = function(name, before) {
	  var create = typeof name === "function" ? name : creator(name),
	      select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
	  return this.select(function() {
	    return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
	  });
	};

	function remove() {
	  var parent = this.parentNode;
	  if (parent) parent.removeChild(this);
	}

	var selection_remove = function() {
	  return this.each(remove);
	};

	var selection_datum = function(value) {
	  return arguments.length
	      ? this.property("__data__", value)
	      : this.node().__data__;
	};

	function dispatchEvent(node, type, params) {
	  var window$$1 = window(node),
	      event = window$$1.CustomEvent;

	  if (event) {
	    event = new event(type, params);
	  } else {
	    event = window$$1.document.createEvent("Event");
	    if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
	    else event.initEvent(type, false, false);
	  }

	  node.dispatchEvent(event);
	}

	function dispatchConstant(type, params) {
	  return function() {
	    return dispatchEvent(this, type, params);
	  };
	}

	function dispatchFunction(type, params) {
	  return function() {
	    return dispatchEvent(this, type, params.apply(this, arguments));
	  };
	}

	var selection_dispatch = function(type, params) {
	  return this.each((typeof params === "function"
	      ? dispatchFunction
	      : dispatchConstant)(type, params));
	};

	var root = [null];

	function Selection(groups, parents) {
	  this._groups = groups;
	  this._parents = parents;
	}

	function selection() {
	  return new Selection([[document.documentElement]], root);
	}

	Selection.prototype = selection.prototype = {
	  constructor: Selection,
	  select: selection_select,
	  selectAll: selection_selectAll,
	  filter: selection_filter,
	  data: selection_data,
	  enter: selection_enter,
	  exit: selection_exit,
	  merge: selection_merge,
	  order: selection_order,
	  sort: selection_sort,
	  call: selection_call,
	  nodes: selection_nodes,
	  node: selection_node,
	  size: selection_size,
	  empty: selection_empty,
	  each: selection_each,
	  attr: selection_attr,
	  style: selection_style,
	  property: selection_property,
	  classed: selection_classed,
	  text: selection_text,
	  html: selection_html,
	  raise: selection_raise,
	  lower: selection_lower,
	  append: selection_append,
	  insert: selection_insert,
	  remove: selection_remove,
	  datum: selection_datum,
	  on: selection_on,
	  dispatch: selection_dispatch
	};

	var select = function(selector) {
	  return typeof selector === "string"
	      ? new Selection([[document.querySelector(selector)]], [document.documentElement])
	      : new Selection([[selector]], root);
	};

	var selectAll = function(selector) {
	  return typeof selector === "string"
	      ? new Selection([document.querySelectorAll(selector)], [document.documentElement])
	      : new Selection([selector == null ? [] : selector], root);
	};

	var touch = function(node, touches, identifier) {
	  if (arguments.length < 3) identifier = touches, touches = sourceEvent().changedTouches;

	  for (var i = 0, n = touches ? touches.length : 0, touch; i < n; ++i) {
	    if ((touch = touches[i]).identifier === identifier) {
	      return point(node, touch);
	    }
	  }

	  return null;
	};

	var touches = function(node, touches) {
	  if (touches == null) touches = sourceEvent().touches;

	  for (var i = 0, n = touches ? touches.length : 0, points = new Array(n); i < n; ++i) {
	    points[i] = point(node, touches[i]);
	  }

	  return points;
	};

	function nopropagation() {
	  exports.event.stopImmediatePropagation();
	}

	var noevent = function() {
	  exports.event.preventDefault();
	  exports.event.stopImmediatePropagation();
	};

	var dragDisable = function(view) {
	  var root = view.document.documentElement,
	      selection$$1 = select(view).on("dragstart.drag", noevent, true);
	  if ("onselectstart" in root) {
	    selection$$1.on("selectstart.drag", noevent, true);
	  } else {
	    root.__noselect = root.style.MozUserSelect;
	    root.style.MozUserSelect = "none";
	  }
	};

	function yesdrag(view, noclick) {
	  var root = view.document.documentElement,
	      selection$$1 = select(view).on("dragstart.drag", null);
	  if (noclick) {
	    selection$$1.on("click.drag", noevent, true);
	    setTimeout(function() { selection$$1.on("click.drag", null); }, 0);
	  }
	  if ("onselectstart" in root) {
	    selection$$1.on("selectstart.drag", null);
	  } else {
	    root.style.MozUserSelect = root.__noselect;
	    delete root.__noselect;
	  }
	}

	var constant$2 = function(x) {
	  return function() {
	    return x;
	  };
	};

	function DragEvent(target, type, subject, id, active, x, y, dx, dy, dispatch) {
	  this.target = target;
	  this.type = type;
	  this.subject = subject;
	  this.identifier = id;
	  this.active = active;
	  this.x = x;
	  this.y = y;
	  this.dx = dx;
	  this.dy = dy;
	  this._ = dispatch;
	}

	DragEvent.prototype.on = function() {
	  var value = this._.on.apply(this._, arguments);
	  return value === this._ ? this : value;
	};

	// Ignore right-click, since that should open the context menu.
	function defaultFilter$1() {
	  return !exports.event.button;
	}

	function defaultContainer() {
	  return this.parentNode;
	}

	function defaultSubject(d) {
	  return d == null ? {x: exports.event.x, y: exports.event.y} : d;
	}

	var drag = function() {
	  var filter = defaultFilter$1,
	      container = defaultContainer,
	      subject = defaultSubject,
	      gestures = {},
	      listeners = dispatch("start", "drag", "end"),
	      active = 0,
	      mousemoving,
	      touchending;

	  function drag(selection$$1) {
	    selection$$1
	        .on("mousedown.drag", mousedowned)
	        .on("touchstart.drag", touchstarted)
	        .on("touchmove.drag", touchmoved)
	        .on("touchend.drag touchcancel.drag", touchended)
	        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
	  }

	  function mousedowned() {
	    if (touchending || !filter.apply(this, arguments)) return;
	    var gesture = beforestart("mouse", container.apply(this, arguments), mouse, this, arguments);
	    if (!gesture) return;
	    select(exports.event.view).on("mousemove.drag", mousemoved, true).on("mouseup.drag", mouseupped, true);
	    dragDisable(exports.event.view);
	    nopropagation();
	    mousemoving = false;
	    gesture("start");
	  }

	  function mousemoved() {
	    noevent();
	    mousemoving = true;
	    gestures.mouse("drag");
	  }

	  function mouseupped() {
	    select(exports.event.view).on("mousemove.drag mouseup.drag", null);
	    yesdrag(exports.event.view, mousemoving);
	    noevent();
	    gestures.mouse("end");
	  }

	  function touchstarted() {
	    if (!filter.apply(this, arguments)) return;
	    var touches$$1 = exports.event.changedTouches,
	        c = container.apply(this, arguments),
	        n = touches$$1.length, i, gesture;

	    for (i = 0; i < n; ++i) {
	      if (gesture = beforestart(touches$$1[i].identifier, c, touch, this, arguments)) {
	        nopropagation();
	        gesture("start");
	      }
	    }
	  }

	  function touchmoved() {
	    var touches$$1 = exports.event.changedTouches,
	        n = touches$$1.length, i, gesture;

	    for (i = 0; i < n; ++i) {
	      if (gesture = gestures[touches$$1[i].identifier]) {
	        noevent();
	        gesture("drag");
	      }
	    }
	  }

	  function touchended() {
	    var touches$$1 = exports.event.changedTouches,
	        n = touches$$1.length, i, gesture;

	    if (touchending) clearTimeout(touchending);
	    touchending = setTimeout(function() { touchending = null; }, 500); // Ghost clicks are delayed!
	    for (i = 0; i < n; ++i) {
	      if (gesture = gestures[touches$$1[i].identifier]) {
	        nopropagation();
	        gesture("end");
	      }
	    }
	  }

	  function beforestart(id, container, point, that, args) {
	    var p = point(container, id), s, dx, dy,
	        sublisteners = listeners.copy();

	    if (!customEvent(new DragEvent(drag, "beforestart", s, id, active, p[0], p[1], 0, 0, sublisteners), function() {
	      if ((exports.event.subject = s = subject.apply(that, args)) == null) return false;
	      dx = s.x - p[0] || 0;
	      dy = s.y - p[1] || 0;
	      return true;
	    })) return;

	    return function gesture(type) {
	      var p0 = p, n;
	      switch (type) {
	        case "start": gestures[id] = gesture, n = active++; break;
	        case "end": delete gestures[id], --active; // nobreak
	        case "drag": p = point(container, id), n = active; break;
	      }
	      customEvent(new DragEvent(drag, type, s, id, n, p[0] + dx, p[1] + dy, p[0] - p0[0], p[1] - p0[1], sublisteners), sublisteners.apply, sublisteners, [type, that, args]);
	    };
	  }

	  drag.filter = function(_) {
	    return arguments.length ? (filter = typeof _ === "function" ? _ : constant$2(!!_), drag) : filter;
	  };

	  drag.container = function(_) {
	    return arguments.length ? (container = typeof _ === "function" ? _ : constant$2(_), drag) : container;
	  };

	  drag.subject = function(_) {
	    return arguments.length ? (subject = typeof _ === "function" ? _ : constant$2(_), drag) : subject;
	  };

	  drag.on = function() {
	    var value = listeners.on.apply(listeners, arguments);
	    return value === listeners ? drag : value;
	  };

	  return drag;
	};

	var define = function(constructor, factory, prototype) {
	  constructor.prototype = factory.prototype = prototype;
	  prototype.constructor = constructor;
	};

	function extend(parent, definition) {
	  var prototype = Object.create(parent.prototype);
	  for (var key in definition) prototype[key] = definition[key];
	  return prototype;
	}

	function Color() {}

	var darker = 0.7;
	var brighter = 1 / darker;

	var reI = "\\s*([+-]?\\d+)\\s*";
	var reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*";
	var reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
	var reHex3 = /^#([0-9a-f]{3})$/;
	var reHex6 = /^#([0-9a-f]{6})$/;
	var reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$");
	var reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$");
	var reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$");
	var reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$");
	var reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$");
	var reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

	var named = {
	  aliceblue: 0xf0f8ff,
	  antiquewhite: 0xfaebd7,
	  aqua: 0x00ffff,
	  aquamarine: 0x7fffd4,
	  azure: 0xf0ffff,
	  beige: 0xf5f5dc,
	  bisque: 0xffe4c4,
	  black: 0x000000,
	  blanchedalmond: 0xffebcd,
	  blue: 0x0000ff,
	  blueviolet: 0x8a2be2,
	  brown: 0xa52a2a,
	  burlywood: 0xdeb887,
	  cadetblue: 0x5f9ea0,
	  chartreuse: 0x7fff00,
	  chocolate: 0xd2691e,
	  coral: 0xff7f50,
	  cornflowerblue: 0x6495ed,
	  cornsilk: 0xfff8dc,
	  crimson: 0xdc143c,
	  cyan: 0x00ffff,
	  darkblue: 0x00008b,
	  darkcyan: 0x008b8b,
	  darkgoldenrod: 0xb8860b,
	  darkgray: 0xa9a9a9,
	  darkgreen: 0x006400,
	  darkgrey: 0xa9a9a9,
	  darkkhaki: 0xbdb76b,
	  darkmagenta: 0x8b008b,
	  darkolivegreen: 0x556b2f,
	  darkorange: 0xff8c00,
	  darkorchid: 0x9932cc,
	  darkred: 0x8b0000,
	  darksalmon: 0xe9967a,
	  darkseagreen: 0x8fbc8f,
	  darkslateblue: 0x483d8b,
	  darkslategray: 0x2f4f4f,
	  darkslategrey: 0x2f4f4f,
	  darkturquoise: 0x00ced1,
	  darkviolet: 0x9400d3,
	  deeppink: 0xff1493,
	  deepskyblue: 0x00bfff,
	  dimgray: 0x696969,
	  dimgrey: 0x696969,
	  dodgerblue: 0x1e90ff,
	  firebrick: 0xb22222,
	  floralwhite: 0xfffaf0,
	  forestgreen: 0x228b22,
	  fuchsia: 0xff00ff,
	  gainsboro: 0xdcdcdc,
	  ghostwhite: 0xf8f8ff,
	  gold: 0xffd700,
	  goldenrod: 0xdaa520,
	  gray: 0x808080,
	  green: 0x008000,
	  greenyellow: 0xadff2f,
	  grey: 0x808080,
	  honeydew: 0xf0fff0,
	  hotpink: 0xff69b4,
	  indianred: 0xcd5c5c,
	  indigo: 0x4b0082,
	  ivory: 0xfffff0,
	  khaki: 0xf0e68c,
	  lavender: 0xe6e6fa,
	  lavenderblush: 0xfff0f5,
	  lawngreen: 0x7cfc00,
	  lemonchiffon: 0xfffacd,
	  lightblue: 0xadd8e6,
	  lightcoral: 0xf08080,
	  lightcyan: 0xe0ffff,
	  lightgoldenrodyellow: 0xfafad2,
	  lightgray: 0xd3d3d3,
	  lightgreen: 0x90ee90,
	  lightgrey: 0xd3d3d3,
	  lightpink: 0xffb6c1,
	  lightsalmon: 0xffa07a,
	  lightseagreen: 0x20b2aa,
	  lightskyblue: 0x87cefa,
	  lightslategray: 0x778899,
	  lightslategrey: 0x778899,
	  lightsteelblue: 0xb0c4de,
	  lightyellow: 0xffffe0,
	  lime: 0x00ff00,
	  limegreen: 0x32cd32,
	  linen: 0xfaf0e6,
	  magenta: 0xff00ff,
	  maroon: 0x800000,
	  mediumaquamarine: 0x66cdaa,
	  mediumblue: 0x0000cd,
	  mediumorchid: 0xba55d3,
	  mediumpurple: 0x9370db,
	  mediumseagreen: 0x3cb371,
	  mediumslateblue: 0x7b68ee,
	  mediumspringgreen: 0x00fa9a,
	  mediumturquoise: 0x48d1cc,
	  mediumvioletred: 0xc71585,
	  midnightblue: 0x191970,
	  mintcream: 0xf5fffa,
	  mistyrose: 0xffe4e1,
	  moccasin: 0xffe4b5,
	  navajowhite: 0xffdead,
	  navy: 0x000080,
	  oldlace: 0xfdf5e6,
	  olive: 0x808000,
	  olivedrab: 0x6b8e23,
	  orange: 0xffa500,
	  orangered: 0xff4500,
	  orchid: 0xda70d6,
	  palegoldenrod: 0xeee8aa,
	  palegreen: 0x98fb98,
	  paleturquoise: 0xafeeee,
	  palevioletred: 0xdb7093,
	  papayawhip: 0xffefd5,
	  peachpuff: 0xffdab9,
	  peru: 0xcd853f,
	  pink: 0xffc0cb,
	  plum: 0xdda0dd,
	  powderblue: 0xb0e0e6,
	  purple: 0x800080,
	  rebeccapurple: 0x663399,
	  red: 0xff0000,
	  rosybrown: 0xbc8f8f,
	  royalblue: 0x4169e1,
	  saddlebrown: 0x8b4513,
	  salmon: 0xfa8072,
	  sandybrown: 0xf4a460,
	  seagreen: 0x2e8b57,
	  seashell: 0xfff5ee,
	  sienna: 0xa0522d,
	  silver: 0xc0c0c0,
	  skyblue: 0x87ceeb,
	  slateblue: 0x6a5acd,
	  slategray: 0x708090,
	  slategrey: 0x708090,
	  snow: 0xfffafa,
	  springgreen: 0x00ff7f,
	  steelblue: 0x4682b4,
	  tan: 0xd2b48c,
	  teal: 0x008080,
	  thistle: 0xd8bfd8,
	  tomato: 0xff6347,
	  turquoise: 0x40e0d0,
	  violet: 0xee82ee,
	  wheat: 0xf5deb3,
	  white: 0xffffff,
	  whitesmoke: 0xf5f5f5,
	  yellow: 0xffff00,
	  yellowgreen: 0x9acd32
	};

	define(Color, color, {
	  displayable: function() {
	    return this.rgb().displayable();
	  },
	  toString: function() {
	    return this.rgb() + "";
	  }
	});

	function color(format) {
	  var m;
	  format = (format + "").trim().toLowerCase();
	  return (m = reHex3.exec(format)) ? (m = parseInt(m[1], 16), new Rgb((m >> 8 & 0xf) | (m >> 4 & 0x0f0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1)) // #f00
	      : (m = reHex6.exec(format)) ? rgbn(parseInt(m[1], 16)) // #ff0000
	      : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
	      : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
	      : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
	      : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
	      : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
	      : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
	      : named.hasOwnProperty(format) ? rgbn(named[format])
	      : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
	      : null;
	}

	function rgbn(n) {
	  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
	}

	function rgba(r, g, b, a) {
	  if (a <= 0) r = g = b = NaN;
	  return new Rgb(r, g, b, a);
	}

	function rgbConvert(o) {
	  if (!(o instanceof Color)) o = color(o);
	  if (!o) return new Rgb;
	  o = o.rgb();
	  return new Rgb(o.r, o.g, o.b, o.opacity);
	}

	function rgb(r, g, b, opacity) {
	  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
	}

	function Rgb(r, g, b, opacity) {
	  this.r = +r;
	  this.g = +g;
	  this.b = +b;
	  this.opacity = +opacity;
	}

	define(Rgb, rgb, extend(Color, {
	  brighter: function(k) {
	    k = k == null ? brighter : Math.pow(brighter, k);
	    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
	  },
	  darker: function(k) {
	    k = k == null ? darker : Math.pow(darker, k);
	    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
	  },
	  rgb: function() {
	    return this;
	  },
	  displayable: function() {
	    return (0 <= this.r && this.r <= 255)
	        && (0 <= this.g && this.g <= 255)
	        && (0 <= this.b && this.b <= 255)
	        && (0 <= this.opacity && this.opacity <= 1);
	  },
	  toString: function() {
	    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
	    return (a === 1 ? "rgb(" : "rgba(")
	        + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
	        + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
	        + Math.max(0, Math.min(255, Math.round(this.b) || 0))
	        + (a === 1 ? ")" : ", " + a + ")");
	  }
	}));

	function hsla(h, s, l, a) {
	  if (a <= 0) h = s = l = NaN;
	  else if (l <= 0 || l >= 1) h = s = NaN;
	  else if (s <= 0) h = NaN;
	  return new Hsl(h, s, l, a);
	}

	function hslConvert(o) {
	  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
	  if (!(o instanceof Color)) o = color(o);
	  if (!o) return new Hsl;
	  if (o instanceof Hsl) return o;
	  o = o.rgb();
	  var r = o.r / 255,
	      g = o.g / 255,
	      b = o.b / 255,
	      min = Math.min(r, g, b),
	      max = Math.max(r, g, b),
	      h = NaN,
	      s = max - min,
	      l = (max + min) / 2;
	  if (s) {
	    if (r === max) h = (g - b) / s + (g < b) * 6;
	    else if (g === max) h = (b - r) / s + 2;
	    else h = (r - g) / s + 4;
	    s /= l < 0.5 ? max + min : 2 - max - min;
	    h *= 60;
	  } else {
	    s = l > 0 && l < 1 ? 0 : h;
	  }
	  return new Hsl(h, s, l, o.opacity);
	}

	function hsl(h, s, l, opacity) {
	  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
	}

	function Hsl(h, s, l, opacity) {
	  this.h = +h;
	  this.s = +s;
	  this.l = +l;
	  this.opacity = +opacity;
	}

	define(Hsl, hsl, extend(Color, {
	  brighter: function(k) {
	    k = k == null ? brighter : Math.pow(brighter, k);
	    return new Hsl(this.h, this.s, this.l * k, this.opacity);
	  },
	  darker: function(k) {
	    k = k == null ? darker : Math.pow(darker, k);
	    return new Hsl(this.h, this.s, this.l * k, this.opacity);
	  },
	  rgb: function() {
	    var h = this.h % 360 + (this.h < 0) * 360,
	        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
	        l = this.l,
	        m2 = l + (l < 0.5 ? l : 1 - l) * s,
	        m1 = 2 * l - m2;
	    return new Rgb(
	      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
	      hsl2rgb(h, m1, m2),
	      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
	      this.opacity
	    );
	  },
	  displayable: function() {
	    return (0 <= this.s && this.s <= 1 || isNaN(this.s))
	        && (0 <= this.l && this.l <= 1)
	        && (0 <= this.opacity && this.opacity <= 1);
	  }
	}));

	/* From FvD 13.37, CSS Color Module Level 3 */
	function hsl2rgb(h, m1, m2) {
	  return (h < 60 ? m1 + (m2 - m1) * h / 60
	      : h < 180 ? m2
	      : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
	      : m1) * 255;
	}

	var deg2rad = Math.PI / 180;
	var rad2deg = 180 / Math.PI;

	var Kn = 18;
	var Xn = 0.950470;
	var Yn = 1;
	var Zn = 1.088830;
	var t0 = 4 / 29;
	var t1 = 6 / 29;
	var t2 = 3 * t1 * t1;
	var t3 = t1 * t1 * t1;

	function labConvert(o) {
	  if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
	  if (o instanceof Hcl) {
	    var h = o.h * deg2rad;
	    return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
	  }
	  if (!(o instanceof Rgb)) o = rgbConvert(o);
	  var b = rgb2xyz(o.r),
	      a = rgb2xyz(o.g),
	      l = rgb2xyz(o.b),
	      x = xyz2lab((0.4124564 * b + 0.3575761 * a + 0.1804375 * l) / Xn),
	      y = xyz2lab((0.2126729 * b + 0.7151522 * a + 0.0721750 * l) / Yn),
	      z = xyz2lab((0.0193339 * b + 0.1191920 * a + 0.9503041 * l) / Zn);
	  return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
	}

	function lab(l, a, b, opacity) {
	  return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
	}

	function Lab(l, a, b, opacity) {
	  this.l = +l;
	  this.a = +a;
	  this.b = +b;
	  this.opacity = +opacity;
	}

	define(Lab, lab, extend(Color, {
	  brighter: function(k) {
	    return new Lab(this.l + Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
	  },
	  darker: function(k) {
	    return new Lab(this.l - Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
	  },
	  rgb: function() {
	    var y = (this.l + 16) / 116,
	        x = isNaN(this.a) ? y : y + this.a / 500,
	        z = isNaN(this.b) ? y : y - this.b / 200;
	    y = Yn * lab2xyz(y);
	    x = Xn * lab2xyz(x);
	    z = Zn * lab2xyz(z);
	    return new Rgb(
	      xyz2rgb( 3.2404542 * x - 1.5371385 * y - 0.4985314 * z), // D65 -> sRGB
	      xyz2rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
	      xyz2rgb( 0.0556434 * x - 0.2040259 * y + 1.0572252 * z),
	      this.opacity
	    );
	  }
	}));

	function xyz2lab(t) {
	  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
	}

	function lab2xyz(t) {
	  return t > t1 ? t * t * t : t2 * (t - t0);
	}

	function xyz2rgb(x) {
	  return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
	}

	function rgb2xyz(x) {
	  return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
	}

	function hclConvert(o) {
	  if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
	  if (!(o instanceof Lab)) o = labConvert(o);
	  var h = Math.atan2(o.b, o.a) * rad2deg;
	  return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
	}

	function hcl(h, c, l, opacity) {
	  return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
	}

	function Hcl(h, c, l, opacity) {
	  this.h = +h;
	  this.c = +c;
	  this.l = +l;
	  this.opacity = +opacity;
	}

	define(Hcl, hcl, extend(Color, {
	  brighter: function(k) {
	    return new Hcl(this.h, this.c, this.l + Kn * (k == null ? 1 : k), this.opacity);
	  },
	  darker: function(k) {
	    return new Hcl(this.h, this.c, this.l - Kn * (k == null ? 1 : k), this.opacity);
	  },
	  rgb: function() {
	    return labConvert(this).rgb();
	  }
	}));

	var A = -0.14861;
	var B = +1.78277;
	var C = -0.29227;
	var D = -0.90649;
	var E = +1.97294;
	var ED = E * D;
	var EB = E * B;
	var BC_DA = B * C - D * A;

	function cubehelixConvert(o) {
	  if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
	  if (!(o instanceof Rgb)) o = rgbConvert(o);
	  var r = o.r / 255,
	      g = o.g / 255,
	      b = o.b / 255,
	      l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
	      bl = b - l,
	      k = (E * (g - l) - C * bl) / D,
	      s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
	      h = s ? Math.atan2(k, bl) * rad2deg - 120 : NaN;
	  return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
	}

	function cubehelix(h, s, l, opacity) {
	  return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
	}

	function Cubehelix(h, s, l, opacity) {
	  this.h = +h;
	  this.s = +s;
	  this.l = +l;
	  this.opacity = +opacity;
	}

	define(Cubehelix, cubehelix, extend(Color, {
	  brighter: function(k) {
	    k = k == null ? brighter : Math.pow(brighter, k);
	    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
	  },
	  darker: function(k) {
	    k = k == null ? darker : Math.pow(darker, k);
	    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
	  },
	  rgb: function() {
	    var h = isNaN(this.h) ? 0 : (this.h + 120) * deg2rad,
	        l = +this.l,
	        a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
	        cosh = Math.cos(h),
	        sinh = Math.sin(h);
	    return new Rgb(
	      255 * (l + a * (A * cosh + B * sinh)),
	      255 * (l + a * (C * cosh + D * sinh)),
	      255 * (l + a * (E * cosh)),
	      this.opacity
	    );
	  }
	}));

	function basis(t1, v0, v1, v2, v3) {
	  var t2 = t1 * t1, t3 = t2 * t1;
	  return ((1 - 3 * t1 + 3 * t2 - t3) * v0
	      + (4 - 6 * t2 + 3 * t3) * v1
	      + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
	      + t3 * v3) / 6;
	}

	var basis$1 = function(values) {
	  var n = values.length - 1;
	  return function(t) {
	    var i = t <= 0 ? (t = 0) : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n),
	        v1 = values[i],
	        v2 = values[i + 1],
	        v0 = i > 0 ? values[i - 1] : 2 * v1 - v2,
	        v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
	    return basis((t - i / n) * n, v0, v1, v2, v3);
	  };
	};

	var basisClosed = function(values) {
	  var n = values.length;
	  return function(t) {
	    var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n),
	        v0 = values[(i + n - 1) % n],
	        v1 = values[i % n],
	        v2 = values[(i + 1) % n],
	        v3 = values[(i + 2) % n];
	    return basis((t - i / n) * n, v0, v1, v2, v3);
	  };
	};

	var constant$3 = function(x) {
	  return function() {
	    return x;
	  };
	};

	function linear(a, d) {
	  return function(t) {
	    return a + t * d;
	  };
	}

	function exponential(a, b, y) {
	  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
	    return Math.pow(a + t * b, y);
	  };
	}

	function hue(a, b) {
	  var d = b - a;
	  return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant$3(isNaN(a) ? b : a);
	}

	function gamma(y) {
	  return (y = +y) === 1 ? nogamma : function(a, b) {
	    return b - a ? exponential(a, b, y) : constant$3(isNaN(a) ? b : a);
	  };
	}

	function nogamma(a, b) {
	  var d = b - a;
	  return d ? linear(a, d) : constant$3(isNaN(a) ? b : a);
	}

	var interpolateRgb = ((function rgbGamma(y) {
	  var color$$1 = gamma(y);

	  function rgb$$1(start, end) {
	    var r = color$$1((start = rgb(start)).r, (end = rgb(end)).r),
	        g = color$$1(start.g, end.g),
	        b = color$$1(start.b, end.b),
	        opacity = nogamma(start.opacity, end.opacity);
	    return function(t) {
	      start.r = r(t);
	      start.g = g(t);
	      start.b = b(t);
	      start.opacity = opacity(t);
	      return start + "";
	    };
	  }

	  rgb$$1.gamma = rgbGamma;

	  return rgb$$1;
	}))(1);

	function rgbSpline(spline) {
	  return function(colors) {
	    var n = colors.length,
	        r = new Array(n),
	        g = new Array(n),
	        b = new Array(n),
	        i, color$$1;
	    for (i = 0; i < n; ++i) {
	      color$$1 = rgb(colors[i]);
	      r[i] = color$$1.r || 0;
	      g[i] = color$$1.g || 0;
	      b[i] = color$$1.b || 0;
	    }
	    r = spline(r);
	    g = spline(g);
	    b = spline(b);
	    color$$1.opacity = 1;
	    return function(t) {
	      color$$1.r = r(t);
	      color$$1.g = g(t);
	      color$$1.b = b(t);
	      return color$$1 + "";
	    };
	  };
	}

	var rgbBasis = rgbSpline(basis$1);
	var rgbBasisClosed = rgbSpline(basisClosed);

	var array$1 = function(a, b) {
	  var nb = b ? b.length : 0,
	      na = a ? Math.min(nb, a.length) : 0,
	      x = new Array(nb),
	      c = new Array(nb),
	      i;

	  for (i = 0; i < na; ++i) x[i] = interpolateValue(a[i], b[i]);
	  for (; i < nb; ++i) c[i] = b[i];

	  return function(t) {
	    for (i = 0; i < na; ++i) c[i] = x[i](t);
	    return c;
	  };
	};

	var date = function(a, b) {
	  var d = new Date;
	  return a = +a, b -= a, function(t) {
	    return d.setTime(a + b * t), d;
	  };
	};

	var reinterpolate = function(a, b) {
	  return a = +a, b -= a, function(t) {
	    return a + b * t;
	  };
	};

	var object = function(a, b) {
	  var i = {},
	      c = {},
	      k;

	  if (a === null || typeof a !== "object") a = {};
	  if (b === null || typeof b !== "object") b = {};

	  for (k in b) {
	    if (k in a) {
	      i[k] = interpolateValue(a[k], b[k]);
	    } else {
	      c[k] = b[k];
	    }
	  }

	  return function(t) {
	    for (k in i) c[k] = i[k](t);
	    return c;
	  };
	};

	var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
	var reB = new RegExp(reA.source, "g");

	function zero(b) {
	  return function() {
	    return b;
	  };
	}

	function one(b) {
	  return function(t) {
	    return b(t) + "";
	  };
	}

	var interpolateString = function(a, b) {
	  var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
	      am, // current match in a
	      bm, // current match in b
	      bs, // string preceding current number in b, if any
	      i = -1, // index in s
	      s = [], // string constants and placeholders
	      q = []; // number interpolators

	  // Coerce inputs to strings.
	  a = a + "", b = b + "";

	  // Interpolate pairs of numbers in a & b.
	  while ((am = reA.exec(a))
	      && (bm = reB.exec(b))) {
	    if ((bs = bm.index) > bi) { // a string precedes the next number in b
	      bs = b.slice(bi, bs);
	      if (s[i]) s[i] += bs; // coalesce with previous string
	      else s[++i] = bs;
	    }
	    if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
	      if (s[i]) s[i] += bm; // coalesce with previous string
	      else s[++i] = bm;
	    } else { // interpolate non-matching numbers
	      s[++i] = null;
	      q.push({i: i, x: reinterpolate(am, bm)});
	    }
	    bi = reB.lastIndex;
	  }

	  // Add remains of b.
	  if (bi < b.length) {
	    bs = b.slice(bi);
	    if (s[i]) s[i] += bs; // coalesce with previous string
	    else s[++i] = bs;
	  }

	  // Special optimization for only a single match.
	  // Otherwise, interpolate each of the numbers and rejoin the string.
	  return s.length < 2 ? (q[0]
	      ? one(q[0].x)
	      : zero(b))
	      : (b = q.length, function(t) {
	          for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
	          return s.join("");
	        });
	};

	var interpolateValue = function(a, b) {
	  var t = typeof b, c;
	  return b == null || t === "boolean" ? constant$3(b)
	      : (t === "number" ? reinterpolate
	      : t === "string" ? ((c = color(b)) ? (b = c, interpolateRgb) : interpolateString)
	      : b instanceof color ? interpolateRgb
	      : b instanceof Date ? date
	      : Array.isArray(b) ? array$1
	      : isNaN(b) ? object
	      : reinterpolate)(a, b);
	};

	var interpolateRound = function(a, b) {
	  return a = +a, b -= a, function(t) {
	    return Math.round(a + b * t);
	  };
	};

	var degrees = 180 / Math.PI;

	var identity$2 = {
	  translateX: 0,
	  translateY: 0,
	  rotate: 0,
	  skewX: 0,
	  scaleX: 1,
	  scaleY: 1
	};

	var decompose = function(a, b, c, d, e, f) {
	  var scaleX, scaleY, skewX;
	  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
	  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
	  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
	  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
	  return {
	    translateX: e,
	    translateY: f,
	    rotate: Math.atan2(b, a) * degrees,
	    skewX: Math.atan(skewX) * degrees,
	    scaleX: scaleX,
	    scaleY: scaleY
	  };
	};

	var cssNode;
	var cssRoot;
	var cssView;
	var svgNode;

	function parseCss(value) {
	  if (value === "none") return identity$2;
	  if (!cssNode) cssNode = document.createElement("DIV"), cssRoot = document.documentElement, cssView = document.defaultView;
	  cssNode.style.transform = value;
	  value = cssView.getComputedStyle(cssRoot.appendChild(cssNode), null).getPropertyValue("transform");
	  cssRoot.removeChild(cssNode);
	  value = value.slice(7, -1).split(",");
	  return decompose(+value[0], +value[1], +value[2], +value[3], +value[4], +value[5]);
	}

	function parseSvg(value) {
	  if (value == null) return identity$2;
	  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
	  svgNode.setAttribute("transform", value);
	  if (!(value = svgNode.transform.baseVal.consolidate())) return identity$2;
	  value = value.matrix;
	  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
	}

	function interpolateTransform(parse, pxComma, pxParen, degParen) {

	  function pop(s) {
	    return s.length ? s.pop() + " " : "";
	  }

	  function translate(xa, ya, xb, yb, s, q) {
	    if (xa !== xb || ya !== yb) {
	      var i = s.push("translate(", null, pxComma, null, pxParen);
	      q.push({i: i - 4, x: reinterpolate(xa, xb)}, {i: i - 2, x: reinterpolate(ya, yb)});
	    } else if (xb || yb) {
	      s.push("translate(" + xb + pxComma + yb + pxParen);
	    }
	  }

	  function rotate(a, b, s, q) {
	    if (a !== b) {
	      if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
	      q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: reinterpolate(a, b)});
	    } else if (b) {
	      s.push(pop(s) + "rotate(" + b + degParen);
	    }
	  }

	  function skewX(a, b, s, q) {
	    if (a !== b) {
	      q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: reinterpolate(a, b)});
	    } else if (b) {
	      s.push(pop(s) + "skewX(" + b + degParen);
	    }
	  }

	  function scale(xa, ya, xb, yb, s, q) {
	    if (xa !== xb || ya !== yb) {
	      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
	      q.push({i: i - 4, x: reinterpolate(xa, xb)}, {i: i - 2, x: reinterpolate(ya, yb)});
	    } else if (xb !== 1 || yb !== 1) {
	      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
	    }
	  }

	  return function(a, b) {
	    var s = [], // string constants and placeholders
	        q = []; // number interpolators
	    a = parse(a), b = parse(b);
	    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
	    rotate(a.rotate, b.rotate, s, q);
	    skewX(a.skewX, b.skewX, s, q);
	    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
	    a = b = null; // gc
	    return function(t) {
	      var i = -1, n = q.length, o;
	      while (++i < n) s[(o = q[i]).i] = o.x(t);
	      return s.join("");
	    };
	  };
	}

	var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
	var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

	var rho = Math.SQRT2;
	var rho2 = 2;
	var rho4 = 4;
	var epsilon2 = 1e-12;

	function cosh(x) {
	  return ((x = Math.exp(x)) + 1 / x) / 2;
	}

	function sinh(x) {
	  return ((x = Math.exp(x)) - 1 / x) / 2;
	}

	function tanh(x) {
	  return ((x = Math.exp(2 * x)) - 1) / (x + 1);
	}

	// p0 = [ux0, uy0, w0]
	// p1 = [ux1, uy1, w1]
	var interpolateZoom = function(p0, p1) {
	  var ux0 = p0[0], uy0 = p0[1], w0 = p0[2],
	      ux1 = p1[0], uy1 = p1[1], w1 = p1[2],
	      dx = ux1 - ux0,
	      dy = uy1 - uy0,
	      d2 = dx * dx + dy * dy,
	      i,
	      S;

	  // Special case for u0 ≅ u1.
	  if (d2 < epsilon2) {
	    S = Math.log(w1 / w0) / rho;
	    i = function(t) {
	      return [
	        ux0 + t * dx,
	        uy0 + t * dy,
	        w0 * Math.exp(rho * t * S)
	      ];
	    };
	  }

	  // General case.
	  else {
	    var d1 = Math.sqrt(d2),
	        b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1),
	        b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1),
	        r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
	        r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
	    S = (r1 - r0) / rho;
	    i = function(t) {
	      var s = t * S,
	          coshr0 = cosh(r0),
	          u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
	      return [
	        ux0 + u * dx,
	        uy0 + u * dy,
	        w0 * coshr0 / cosh(rho * s + r0)
	      ];
	    };
	  }

	  i.duration = S * 1000;

	  return i;
	};

	function hsl$1(hue$$1) {
	  return function(start, end) {
	    var h = hue$$1((start = hsl(start)).h, (end = hsl(end)).h),
	        s = nogamma(start.s, end.s),
	        l = nogamma(start.l, end.l),
	        opacity = nogamma(start.opacity, end.opacity);
	    return function(t) {
	      start.h = h(t);
	      start.s = s(t);
	      start.l = l(t);
	      start.opacity = opacity(t);
	      return start + "";
	    };
	  }
	}

	var hsl$2 = hsl$1(hue);
	var hslLong = hsl$1(nogamma);

	function lab$1(start, end) {
	  var l = nogamma((start = lab(start)).l, (end = lab(end)).l),
	      a = nogamma(start.a, end.a),
	      b = nogamma(start.b, end.b),
	      opacity = nogamma(start.opacity, end.opacity);
	  return function(t) {
	    start.l = l(t);
	    start.a = a(t);
	    start.b = b(t);
	    start.opacity = opacity(t);
	    return start + "";
	  };
	}

	function hcl$1(hue$$1) {
	  return function(start, end) {
	    var h = hue$$1((start = hcl(start)).h, (end = hcl(end)).h),
	        c = nogamma(start.c, end.c),
	        l = nogamma(start.l, end.l),
	        opacity = nogamma(start.opacity, end.opacity);
	    return function(t) {
	      start.h = h(t);
	      start.c = c(t);
	      start.l = l(t);
	      start.opacity = opacity(t);
	      return start + "";
	    };
	  }
	}

	var hcl$2 = hcl$1(hue);
	var hclLong = hcl$1(nogamma);

	function cubehelix$1(hue$$1) {
	  return (function cubehelixGamma(y) {
	    y = +y;

	    function cubehelix$$1(start, end) {
	      var h = hue$$1((start = cubehelix(start)).h, (end = cubehelix(end)).h),
	          s = nogamma(start.s, end.s),
	          l = nogamma(start.l, end.l),
	          opacity = nogamma(start.opacity, end.opacity);
	      return function(t) {
	        start.h = h(t);
	        start.s = s(t);
	        start.l = l(Math.pow(t, y));
	        start.opacity = opacity(t);
	        return start + "";
	      };
	    }

	    cubehelix$$1.gamma = cubehelixGamma;

	    return cubehelix$$1;
	  })(1);
	}

	var cubehelix$2 = cubehelix$1(hue);
	var cubehelixLong = cubehelix$1(nogamma);

	var quantize = function(interpolator, n) {
	  var samples = new Array(n);
	  for (var i = 0; i < n; ++i) samples[i] = interpolator(i / (n - 1));
	  return samples;
	};

	var frame = 0;
	var timeout = 0;
	var interval = 0;
	var pokeDelay = 1000;
	var taskHead;
	var taskTail;
	var clockLast = 0;
	var clockNow = 0;
	var clockSkew = 0;
	var clock = typeof performance === "object" && performance.now ? performance : Date;
	var setFrame = typeof requestAnimationFrame === "function" ? requestAnimationFrame : function(f) { setTimeout(f, 17); };

	function now() {
	  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
	}

	function clearNow() {
	  clockNow = 0;
	}

	function Timer() {
	  this._call =
	  this._time =
	  this._next = null;
	}

	Timer.prototype = timer.prototype = {
	  constructor: Timer,
	  restart: function(callback, delay, time) {
	    if (typeof callback !== "function") throw new TypeError("callback is not a function");
	    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
	    if (!this._next && taskTail !== this) {
	      if (taskTail) taskTail._next = this;
	      else taskHead = this;
	      taskTail = this;
	    }
	    this._call = callback;
	    this._time = time;
	    sleep();
	  },
	  stop: function() {
	    if (this._call) {
	      this._call = null;
	      this._time = Infinity;
	      sleep();
	    }
	  }
	};

	function timer(callback, delay, time) {
	  var t = new Timer;
	  t.restart(callback, delay, time);
	  return t;
	}

	function timerFlush() {
	  now(); // Get the current time, if not already set.
	  ++frame; // Pretend we’ve set an alarm, if we haven’t already.
	  var t = taskHead, e;
	  while (t) {
	    if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
	    t = t._next;
	  }
	  --frame;
	}

	function wake() {
	  clockNow = (clockLast = clock.now()) + clockSkew;
	  frame = timeout = 0;
	  try {
	    timerFlush();
	  } finally {
	    frame = 0;
	    nap();
	    clockNow = 0;
	  }
	}

	function poke() {
	  var now = clock.now(), delay = now - clockLast;
	  if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
	}

	function nap() {
	  var t0, t1 = taskHead, t2, time = Infinity;
	  while (t1) {
	    if (t1._call) {
	      if (time > t1._time) time = t1._time;
	      t0 = t1, t1 = t1._next;
	    } else {
	      t2 = t1._next, t1._next = null;
	      t1 = t0 ? t0._next = t2 : taskHead = t2;
	    }
	  }
	  taskTail = t0;
	  sleep(time);
	}

	function sleep(time) {
	  if (frame) return; // Soonest alarm already set, or will be.
	  if (timeout) timeout = clearTimeout(timeout);
	  var delay = time - clockNow;
	  if (delay > 24) {
	    if (time < Infinity) timeout = setTimeout(wake, delay);
	    if (interval) interval = clearInterval(interval);
	  } else {
	    if (!interval) clockLast = clockNow, interval = setInterval(poke, pokeDelay);
	    frame = 1, setFrame(wake);
	  }
	}

	var timeout$1 = function(callback, delay, time) {
	  var t = new Timer;
	  delay = delay == null ? 0 : +delay;
	  t.restart(function(elapsed) {
	    t.stop();
	    callback(elapsed + delay);
	  }, delay, time);
	  return t;
	};

	var interval$1 = function(callback, delay, time) {
	  var t = new Timer, total = delay;
	  if (delay == null) return t.restart(callback, delay, time), t;
	  delay = +delay, time = time == null ? now() : +time;
	  t.restart(function tick(elapsed) {
	    elapsed += total;
	    t.restart(tick, total += delay, time);
	    callback(elapsed);
	  }, delay, time);
	  return t;
	};

	var emptyOn = dispatch("start", "end", "interrupt");
	var emptyTween = [];

	var CREATED = 0;
	var SCHEDULED = 1;
	var STARTING = 2;
	var STARTED = 3;
	var RUNNING = 4;
	var ENDING = 5;
	var ENDED = 6;

	var schedule = function(node, name, id, index, group, timing) {
	  var schedules = node.__transition;
	  if (!schedules) node.__transition = {};
	  else if (id in schedules) return;
	  create(node, id, {
	    name: name,
	    index: index, // For context during callback.
	    group: group, // For context during callback.
	    on: emptyOn,
	    tween: emptyTween,
	    time: timing.time,
	    delay: timing.delay,
	    duration: timing.duration,
	    ease: timing.ease,
	    timer: null,
	    state: CREATED
	  });
	};

	function init(node, id) {
	  var schedule = node.__transition;
	  if (!schedule || !(schedule = schedule[id]) || schedule.state > CREATED) throw new Error("too late");
	  return schedule;
	}

	function set$1(node, id) {
	  var schedule = node.__transition;
	  if (!schedule || !(schedule = schedule[id]) || schedule.state > STARTING) throw new Error("too late");
	  return schedule;
	}

	function get$1(node, id) {
	  var schedule = node.__transition;
	  if (!schedule || !(schedule = schedule[id])) throw new Error("too late");
	  return schedule;
	}

	function create(node, id, self) {
	  var schedules = node.__transition,
	      tween;

	  // Initialize the self timer when the transition is created.
	  // Note the actual delay is not known until the first callback!
	  schedules[id] = self;
	  self.timer = timer(schedule, 0, self.time);

	  function schedule(elapsed) {
	    self.state = SCHEDULED;
	    self.timer.restart(start, self.delay, self.time);

	    // If the elapsed delay is less than our first sleep, start immediately.
	    if (self.delay <= elapsed) start(elapsed - self.delay);
	  }

	  function start(elapsed) {
	    var i, j, n, o;

	    // If the state is not SCHEDULED, then we previously errored on start.
	    if (self.state !== SCHEDULED) return stop();

	    for (i in schedules) {
	      o = schedules[i];
	      if (o.name !== self.name) continue;

	      // While this element already has a starting transition during this frame,
	      // defer starting an interrupting transition until that transition has a
	      // chance to tick (and possibly end); see d3/d3-transition#54!
	      if (o.state === STARTED) return timeout$1(start);

	      // Interrupt the active transition, if any.
	      // Dispatch the interrupt event.
	      if (o.state === RUNNING) {
	        o.state = ENDED;
	        o.timer.stop();
	        o.on.call("interrupt", node, node.__data__, o.index, o.group);
	        delete schedules[i];
	      }

	      // Cancel any pre-empted transitions. No interrupt event is dispatched
	      // because the cancelled transitions never started. Note that this also
	      // removes this transition from the pending list!
	      else if (+i < id) {
	        o.state = ENDED;
	        o.timer.stop();
	        delete schedules[i];
	      }
	    }

	    // Defer the first tick to end of the current frame; see d3/d3#1576.
	    // Note the transition may be canceled after start and before the first tick!
	    // Note this must be scheduled before the start event; see d3/d3-transition#16!
	    // Assuming this is successful, subsequent callbacks go straight to tick.
	    timeout$1(function() {
	      if (self.state === STARTED) {
	        self.state = RUNNING;
	        self.timer.restart(tick, self.delay, self.time);
	        tick(elapsed);
	      }
	    });

	    // Dispatch the start event.
	    // Note this must be done before the tween are initialized.
	    self.state = STARTING;
	    self.on.call("start", node, node.__data__, self.index, self.group);
	    if (self.state !== STARTING) return; // interrupted
	    self.state = STARTED;

	    // Initialize the tween, deleting null tween.
	    tween = new Array(n = self.tween.length);
	    for (i = 0, j = -1; i < n; ++i) {
	      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
	        tween[++j] = o;
	      }
	    }
	    tween.length = j + 1;
	  }

	  function tick(elapsed) {
	    var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
	        i = -1,
	        n = tween.length;

	    while (++i < n) {
	      tween[i].call(null, t);
	    }

	    // Dispatch the end event.
	    if (self.state === ENDING) {
	      self.on.call("end", node, node.__data__, self.index, self.group);
	      stop();
	    }
	  }

	  function stop() {
	    self.state = ENDED;
	    self.timer.stop();
	    delete schedules[id];
	    for (var i in schedules) return; // eslint-disable-line no-unused-vars
	    delete node.__transition;
	  }
	}

	var interrupt = function(node, name) {
	  var schedules = node.__transition,
	      schedule,
	      active,
	      empty = true,
	      i;

	  if (!schedules) return;

	  name = name == null ? null : name + "";

	  for (i in schedules) {
	    if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
	    active = schedule.state > STARTING && schedule.state < ENDING;
	    schedule.state = ENDED;
	    schedule.timer.stop();
	    if (active) schedule.on.call("interrupt", node, node.__data__, schedule.index, schedule.group);
	    delete schedules[i];
	  }

	  if (empty) delete node.__transition;
	};

	var selection_interrupt = function(name) {
	  return this.each(function() {
	    interrupt(this, name);
	  });
	};

	function tweenRemove(id, name) {
	  var tween0, tween1;
	  return function() {
	    var schedule = set$1(this, id),
	        tween = schedule.tween;

	    // If this node shared tween with the previous node,
	    // just assign the updated shared tween and we’re done!
	    // Otherwise, copy-on-write.
	    if (tween !== tween0) {
	      tween1 = tween0 = tween;
	      for (var i = 0, n = tween1.length; i < n; ++i) {
	        if (tween1[i].name === name) {
	          tween1 = tween1.slice();
	          tween1.splice(i, 1);
	          break;
	        }
	      }
	    }

	    schedule.tween = tween1;
	  };
	}

	function tweenFunction(id, name, value) {
	  var tween0, tween1;
	  if (typeof value !== "function") throw new Error;
	  return function() {
	    var schedule = set$1(this, id),
	        tween = schedule.tween;

	    // If this node shared tween with the previous node,
	    // just assign the updated shared tween and we’re done!
	    // Otherwise, copy-on-write.
	    if (tween !== tween0) {
	      tween1 = (tween0 = tween).slice();
	      for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
	        if (tween1[i].name === name) {
	          tween1[i] = t;
	          break;
	        }
	      }
	      if (i === n) tween1.push(t);
	    }

	    schedule.tween = tween1;
	  };
	}

	var transition_tween = function(name, value) {
	  var id = this._id;

	  name += "";

	  if (arguments.length < 2) {
	    var tween = get$1(this.node(), id).tween;
	    for (var i = 0, n = tween.length, t; i < n; ++i) {
	      if ((t = tween[i]).name === name) {
	        return t.value;
	      }
	    }
	    return null;
	  }

	  return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
	};

	function tweenValue(transition, name, value) {
	  var id = transition._id;

	  transition.each(function() {
	    var schedule = set$1(this, id);
	    (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
	  });

	  return function(node) {
	    return get$1(node, id).value[name];
	  };
	}

	var interpolate$$1 = function(a, b) {
	  var c;
	  return (typeof b === "number" ? reinterpolate
	      : b instanceof color ? interpolateRgb
	      : (c = color(b)) ? (b = c, interpolateRgb)
	      : interpolateString)(a, b);
	};

	function attrRemove$1(name) {
	  return function() {
	    this.removeAttribute(name);
	  };
	}

	function attrRemoveNS$1(fullname) {
	  return function() {
	    this.removeAttributeNS(fullname.space, fullname.local);
	  };
	}

	function attrConstant$1(name, interpolate$$1, value1) {
	  var value00,
	      interpolate0;
	  return function() {
	    var value0 = this.getAttribute(name);
	    return value0 === value1 ? null
	        : value0 === value00 ? interpolate0
	        : interpolate0 = interpolate$$1(value00 = value0, value1);
	  };
	}

	function attrConstantNS$1(fullname, interpolate$$1, value1) {
	  var value00,
	      interpolate0;
	  return function() {
	    var value0 = this.getAttributeNS(fullname.space, fullname.local);
	    return value0 === value1 ? null
	        : value0 === value00 ? interpolate0
	        : interpolate0 = interpolate$$1(value00 = value0, value1);
	  };
	}

	function attrFunction$1(name, interpolate$$1, value) {
	  var value00,
	      value10,
	      interpolate0;
	  return function() {
	    var value0, value1 = value(this);
	    if (value1 == null) return void this.removeAttribute(name);
	    value0 = this.getAttribute(name);
	    return value0 === value1 ? null
	        : value0 === value00 && value1 === value10 ? interpolate0
	        : interpolate0 = interpolate$$1(value00 = value0, value10 = value1);
	  };
	}

	function attrFunctionNS$1(fullname, interpolate$$1, value) {
	  var value00,
	      value10,
	      interpolate0;
	  return function() {
	    var value0, value1 = value(this);
	    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
	    value0 = this.getAttributeNS(fullname.space, fullname.local);
	    return value0 === value1 ? null
	        : value0 === value00 && value1 === value10 ? interpolate0
	        : interpolate0 = interpolate$$1(value00 = value0, value10 = value1);
	  };
	}

	var transition_attr = function(name, value) {
	  var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate$$1;
	  return this.attrTween(name, typeof value === "function"
	      ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)(fullname, i, tweenValue(this, "attr." + name, value))
	      : value == null ? (fullname.local ? attrRemoveNS$1 : attrRemove$1)(fullname)
	      : (fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, i, value + ""));
	};

	function attrTweenNS(fullname, value) {
	  function tween() {
	    var node = this, i = value.apply(node, arguments);
	    return i && function(t) {
	      node.setAttributeNS(fullname.space, fullname.local, i(t));
	    };
	  }
	  tween._value = value;
	  return tween;
	}

	function attrTween(name, value) {
	  function tween() {
	    var node = this, i = value.apply(node, arguments);
	    return i && function(t) {
	      node.setAttribute(name, i(t));
	    };
	  }
	  tween._value = value;
	  return tween;
	}

	var transition_attrTween = function(name, value) {
	  var key = "attr." + name;
	  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
	  if (value == null) return this.tween(key, null);
	  if (typeof value !== "function") throw new Error;
	  var fullname = namespace(name);
	  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
	};

	function delayFunction(id, value) {
	  return function() {
	    init(this, id).delay = +value.apply(this, arguments);
	  };
	}

	function delayConstant(id, value) {
	  return value = +value, function() {
	    init(this, id).delay = value;
	  };
	}

	var transition_delay = function(value) {
	  var id = this._id;

	  return arguments.length
	      ? this.each((typeof value === "function"
	          ? delayFunction
	          : delayConstant)(id, value))
	      : get$1(this.node(), id).delay;
	};

	function durationFunction(id, value) {
	  return function() {
	    set$1(this, id).duration = +value.apply(this, arguments);
	  };
	}

	function durationConstant(id, value) {
	  return value = +value, function() {
	    set$1(this, id).duration = value;
	  };
	}

	var transition_duration = function(value) {
	  var id = this._id;

	  return arguments.length
	      ? this.each((typeof value === "function"
	          ? durationFunction
	          : durationConstant)(id, value))
	      : get$1(this.node(), id).duration;
	};

	function easeConstant(id, value) {
	  if (typeof value !== "function") throw new Error;
	  return function() {
	    set$1(this, id).ease = value;
	  };
	}

	var transition_ease = function(value) {
	  var id = this._id;

	  return arguments.length
	      ? this.each(easeConstant(id, value))
	      : get$1(this.node(), id).ease;
	};

	var transition_filter = function(match) {
	  if (typeof match !== "function") match = matcher$1(match);

	  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
	    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
	      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
	        subgroup.push(node);
	      }
	    }
	  }

	  return new Transition(subgroups, this._parents, this._name, this._id);
	};

	var transition_merge = function(transition) {
	  if (transition._id !== this._id) throw new Error;

	  for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
	    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
	      if (node = group0[i] || group1[i]) {
	        merge[i] = node;
	      }
	    }
	  }

	  for (; j < m0; ++j) {
	    merges[j] = groups0[j];
	  }

	  return new Transition(merges, this._parents, this._name, this._id);
	};

	function start(name) {
	  return (name + "").trim().split(/^|\s+/).every(function(t) {
	    var i = t.indexOf(".");
	    if (i >= 0) t = t.slice(0, i);
	    return !t || t === "start";
	  });
	}

	function onFunction(id, name, listener) {
	  var on0, on1, sit = start(name) ? init : set$1;
	  return function() {
	    var schedule = sit(this, id),
	        on = schedule.on;

	    // If this node shared a dispatch with the previous node,
	    // just assign the updated shared dispatch and we’re done!
	    // Otherwise, copy-on-write.
	    if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

	    schedule.on = on1;
	  };
	}

	var transition_on = function(name, listener) {
	  var id = this._id;

	  return arguments.length < 2
	      ? get$1(this.node(), id).on.on(name)
	      : this.each(onFunction(id, name, listener));
	};

	function removeFunction(id) {
	  return function() {
	    var parent = this.parentNode;
	    for (var i in this.__transition) if (+i !== id) return;
	    if (parent) parent.removeChild(this);
	  };
	}

	var transition_remove = function() {
	  return this.on("end.remove", removeFunction(this._id));
	};

	var transition_select = function(select$$1) {
	  var name = this._name,
	      id = this._id;

	  if (typeof select$$1 !== "function") select$$1 = selector(select$$1);

	  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
	    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
	      if ((node = group[i]) && (subnode = select$$1.call(node, node.__data__, i, group))) {
	        if ("__data__" in node) subnode.__data__ = node.__data__;
	        subgroup[i] = subnode;
	        schedule(subgroup[i], name, id, i, subgroup, get$1(node, id));
	      }
	    }
	  }

	  return new Transition(subgroups, this._parents, name, id);
	};

	var transition_selectAll = function(select$$1) {
	  var name = this._name,
	      id = this._id;

	  if (typeof select$$1 !== "function") select$$1 = selectorAll(select$$1);

	  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
	    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
	      if (node = group[i]) {
	        for (var children = select$$1.call(node, node.__data__, i, group), child, inherit = get$1(node, id), k = 0, l = children.length; k < l; ++k) {
	          if (child = children[k]) {
	            schedule(child, name, id, k, children, inherit);
	          }
	        }
	        subgroups.push(children);
	        parents.push(node);
	      }
	    }
	  }

	  return new Transition(subgroups, parents, name, id);
	};

	var Selection$1 = selection.prototype.constructor;

	var transition_selection = function() {
	  return new Selection$1(this._groups, this._parents);
	};

	function styleRemove$1(name, interpolate$$2) {
	  var value00,
	      value10,
	      interpolate0;
	  return function() {
	    var style = window(this).getComputedStyle(this, null),
	        value0 = style.getPropertyValue(name),
	        value1 = (this.style.removeProperty(name), style.getPropertyValue(name));
	    return value0 === value1 ? null
	        : value0 === value00 && value1 === value10 ? interpolate0
	        : interpolate0 = interpolate$$2(value00 = value0, value10 = value1);
	  };
	}

	function styleRemoveEnd(name) {
	  return function() {
	    this.style.removeProperty(name);
	  };
	}

	function styleConstant$1(name, interpolate$$2, value1) {
	  var value00,
	      interpolate0;
	  return function() {
	    var value0 = window(this).getComputedStyle(this, null).getPropertyValue(name);
	    return value0 === value1 ? null
	        : value0 === value00 ? interpolate0
	        : interpolate0 = interpolate$$2(value00 = value0, value1);
	  };
	}

	function styleFunction$1(name, interpolate$$2, value) {
	  var value00,
	      value10,
	      interpolate0;
	  return function() {
	    var style = window(this).getComputedStyle(this, null),
	        value0 = style.getPropertyValue(name),
	        value1 = value(this);
	    if (value1 == null) value1 = (this.style.removeProperty(name), style.getPropertyValue(name));
	    return value0 === value1 ? null
	        : value0 === value00 && value1 === value10 ? interpolate0
	        : interpolate0 = interpolate$$2(value00 = value0, value10 = value1);
	  };
	}

	var transition_style = function(name, value, priority) {
	  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate$$1;
	  return value == null ? this
	          .styleTween(name, styleRemove$1(name, i))
	          .on("end.style." + name, styleRemoveEnd(name))
	      : this.styleTween(name, typeof value === "function"
	          ? styleFunction$1(name, i, tweenValue(this, "style." + name, value))
	          : styleConstant$1(name, i, value + ""), priority);
	};

	function styleTween(name, value, priority) {
	  function tween() {
	    var node = this, i = value.apply(node, arguments);
	    return i && function(t) {
	      node.style.setProperty(name, i(t), priority);
	    };
	  }
	  tween._value = value;
	  return tween;
	}

	var transition_styleTween = function(name, value, priority) {
	  var key = "style." + (name += "");
	  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
	  if (value == null) return this.tween(key, null);
	  if (typeof value !== "function") throw new Error;
	  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
	};

	function textConstant$1(value) {
	  return function() {
	    this.textContent = value;
	  };
	}

	function textFunction$1(value) {
	  return function() {
	    var value1 = value(this);
	    this.textContent = value1 == null ? "" : value1;
	  };
	}

	var transition_text = function(value) {
	  return this.tween("text", typeof value === "function"
	      ? textFunction$1(tweenValue(this, "text", value))
	      : textConstant$1(value == null ? "" : value + ""));
	};

	var transition_transition = function() {
	  var name = this._name,
	      id0 = this._id,
	      id1 = newId();

	  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
	    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
	      if (node = group[i]) {
	        var inherit = get$1(node, id0);
	        schedule(node, name, id1, i, group, {
	          time: inherit.time + inherit.delay + inherit.duration,
	          delay: 0,
	          duration: inherit.duration,
	          ease: inherit.ease
	        });
	      }
	    }
	  }

	  return new Transition(groups, this._parents, name, id1);
	};

	var id = 0;

	function Transition(groups, parents, name, id) {
	  this._groups = groups;
	  this._parents = parents;
	  this._name = name;
	  this._id = id;
	}

	function transition(name) {
	  return selection().transition(name);
	}

	function newId() {
	  return ++id;
	}

	var selection_prototype = selection.prototype;

	Transition.prototype = transition.prototype = {
	  constructor: Transition,
	  select: transition_select,
	  selectAll: transition_selectAll,
	  filter: transition_filter,
	  merge: transition_merge,
	  selection: transition_selection,
	  transition: transition_transition,
	  call: selection_prototype.call,
	  nodes: selection_prototype.nodes,
	  node: selection_prototype.node,
	  size: selection_prototype.size,
	  empty: selection_prototype.empty,
	  each: selection_prototype.each,
	  on: transition_on,
	  attr: transition_attr,
	  attrTween: transition_attrTween,
	  style: transition_style,
	  styleTween: transition_styleTween,
	  text: transition_text,
	  remove: transition_remove,
	  tween: transition_tween,
	  delay: transition_delay,
	  duration: transition_duration,
	  ease: transition_ease
	};

	function linear$1(t) {
	  return +t;
	}

	function quadIn(t) {
	  return t * t;
	}

	function quadOut(t) {
	  return t * (2 - t);
	}

	function quadInOut(t) {
	  return ((t *= 2) <= 1 ? t * t : --t * (2 - t) + 1) / 2;
	}

	function cubicIn(t) {
	  return t * t * t;
	}

	function cubicOut(t) {
	  return --t * t * t + 1;
	}

	function cubicInOut(t) {
	  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
	}

	var exponent = 3;

	var polyIn = (function custom(e) {
	  e = +e;

	  function polyIn(t) {
	    return Math.pow(t, e);
	  }

	  polyIn.exponent = custom;

	  return polyIn;
	})(exponent);

	var polyOut = (function custom(e) {
	  e = +e;

	  function polyOut(t) {
	    return 1 - Math.pow(1 - t, e);
	  }

	  polyOut.exponent = custom;

	  return polyOut;
	})(exponent);

	var polyInOut = (function custom(e) {
	  e = +e;

	  function polyInOut(t) {
	    return ((t *= 2) <= 1 ? Math.pow(t, e) : 2 - Math.pow(2 - t, e)) / 2;
	  }

	  polyInOut.exponent = custom;

	  return polyInOut;
	})(exponent);

	var pi = Math.PI;
	var halfPi = pi / 2;

	function sinIn(t) {
	  return 1 - Math.cos(t * halfPi);
	}

	function sinOut(t) {
	  return Math.sin(t * halfPi);
	}

	function sinInOut(t) {
	  return (1 - Math.cos(pi * t)) / 2;
	}

	function expIn(t) {
	  return Math.pow(2, 10 * t - 10);
	}

	function expOut(t) {
	  return 1 - Math.pow(2, -10 * t);
	}

	function expInOut(t) {
	  return ((t *= 2) <= 1 ? Math.pow(2, 10 * t - 10) : 2 - Math.pow(2, 10 - 10 * t)) / 2;
	}

	function circleIn(t) {
	  return 1 - Math.sqrt(1 - t * t);
	}

	function circleOut(t) {
	  return Math.sqrt(1 - --t * t);
	}

	function circleInOut(t) {
	  return ((t *= 2) <= 1 ? 1 - Math.sqrt(1 - t * t) : Math.sqrt(1 - (t -= 2) * t) + 1) / 2;
	}

	var b1 = 4 / 11;
	var b2 = 6 / 11;
	var b3 = 8 / 11;
	var b4 = 3 / 4;
	var b5 = 9 / 11;
	var b6 = 10 / 11;
	var b7 = 15 / 16;
	var b8 = 21 / 22;
	var b9 = 63 / 64;
	var b0 = 1 / b1 / b1;

	function bounceIn(t) {
	  return 1 - bounceOut(1 - t);
	}

	function bounceOut(t) {
	  return (t = +t) < b1 ? b0 * t * t : t < b3 ? b0 * (t -= b2) * t + b4 : t < b6 ? b0 * (t -= b5) * t + b7 : b0 * (t -= b8) * t + b9;
	}

	function bounceInOut(t) {
	  return ((t *= 2) <= 1 ? 1 - bounceOut(1 - t) : bounceOut(t - 1) + 1) / 2;
	}

	var overshoot = 1.70158;

	var backIn = (function custom(s) {
	  s = +s;

	  function backIn(t) {
	    return t * t * ((s + 1) * t - s);
	  }

	  backIn.overshoot = custom;

	  return backIn;
	})(overshoot);

	var backOut = (function custom(s) {
	  s = +s;

	  function backOut(t) {
	    return --t * t * ((s + 1) * t + s) + 1;
	  }

	  backOut.overshoot = custom;

	  return backOut;
	})(overshoot);

	var backInOut = (function custom(s) {
	  s = +s;

	  function backInOut(t) {
	    return ((t *= 2) < 1 ? t * t * ((s + 1) * t - s) : (t -= 2) * t * ((s + 1) * t + s) + 2) / 2;
	  }

	  backInOut.overshoot = custom;

	  return backInOut;
	})(overshoot);

	var tau = 2 * Math.PI;
	var amplitude = 1;
	var period = 0.3;

	var elasticIn = (function custom(a, p) {
	  var s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau);

	  function elasticIn(t) {
	    return a * Math.pow(2, 10 * --t) * Math.sin((s - t) / p);
	  }

	  elasticIn.amplitude = function(a) { return custom(a, p * tau); };
	  elasticIn.period = function(p) { return custom(a, p); };

	  return elasticIn;
	})(amplitude, period);

	var elasticOut = (function custom(a, p) {
	  var s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau);

	  function elasticOut(t) {
	    return 1 - a * Math.pow(2, -10 * (t = +t)) * Math.sin((t + s) / p);
	  }

	  elasticOut.amplitude = function(a) { return custom(a, p * tau); };
	  elasticOut.period = function(p) { return custom(a, p); };

	  return elasticOut;
	})(amplitude, period);

	var elasticInOut = (function custom(a, p) {
	  var s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau);

	  function elasticInOut(t) {
	    return ((t = t * 2 - 1) < 0
	        ? a * Math.pow(2, 10 * t) * Math.sin((s - t) / p)
	        : 2 - a * Math.pow(2, -10 * t) * Math.sin((s + t) / p)) / 2;
	  }

	  elasticInOut.amplitude = function(a) { return custom(a, p * tau); };
	  elasticInOut.period = function(p) { return custom(a, p); };

	  return elasticInOut;
	})(amplitude, period);

	var defaultTiming = {
	  time: null, // Set on use.
	  delay: 0,
	  duration: 250,
	  ease: cubicInOut
	};

	function inherit(node, id) {
	  var timing;
	  while (!(timing = node.__transition) || !(timing = timing[id])) {
	    if (!(node = node.parentNode)) {
	      return defaultTiming.time = now(), defaultTiming;
	    }
	  }
	  return timing;
	}

	var selection_transition = function(name) {
	  var id,
	      timing;

	  if (name instanceof Transition) {
	    id = name._id, name = name._name;
	  } else {
	    id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
	  }

	  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
	    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
	      if (node = group[i]) {
	        schedule(node, name, id, i, group, timing || inherit(node, id));
	      }
	    }
	  }

	  return new Transition(groups, this._parents, name, id);
	};

	selection.prototype.interrupt = selection_interrupt;
	selection.prototype.transition = selection_transition;

	var root$1 = [null];

	var active = function(node, name) {
	  var schedules = node.__transition,
	      schedule,
	      i;

	  if (schedules) {
	    name = name == null ? null : name + "";
	    for (i in schedules) {
	      if ((schedule = schedules[i]).state > SCHEDULED && schedule.name === name) {
	        return new Transition([[node]], root$1, name, +i);
	      }
	    }
	  }

	  return null;
	};

	var constant$4 = function(x) {
	  return function() {
	    return x;
	  };
	};

	var BrushEvent = function(target, type, selection) {
	  this.target = target;
	  this.type = type;
	  this.selection = selection;
	};

	function nopropagation$1() {
	  exports.event.stopImmediatePropagation();
	}

	var noevent$1 = function() {
	  exports.event.preventDefault();
	  exports.event.stopImmediatePropagation();
	};

	var MODE_DRAG = {name: "drag"};
	var MODE_SPACE = {name: "space"};
	var MODE_HANDLE = {name: "handle"};
	var MODE_CENTER = {name: "center"};

	var X = {
	  name: "x",
	  handles: ["e", "w"].map(type),
	  input: function(x, e) { return x && [[x[0], e[0][1]], [x[1], e[1][1]]]; },
	  output: function(xy) { return xy && [xy[0][0], xy[1][0]]; }
	};

	var Y = {
	  name: "y",
	  handles: ["n", "s"].map(type),
	  input: function(y, e) { return y && [[e[0][0], y[0]], [e[1][0], y[1]]]; },
	  output: function(xy) { return xy && [xy[0][1], xy[1][1]]; }
	};

	var XY = {
	  name: "xy",
	  handles: ["n", "e", "s", "w", "nw", "ne", "se", "sw"].map(type),
	  input: function(xy) { return xy; },
	  output: function(xy) { return xy; }
	};

	var cursors = {
	  overlay: "crosshair",
	  selection: "move",
	  n: "ns-resize",
	  e: "ew-resize",
	  s: "ns-resize",
	  w: "ew-resize",
	  nw: "nwse-resize",
	  ne: "nesw-resize",
	  se: "nwse-resize",
	  sw: "nesw-resize"
	};

	var flipX = {
	  e: "w",
	  w: "e",
	  nw: "ne",
	  ne: "nw",
	  se: "sw",
	  sw: "se"
	};

	var flipY = {
	  n: "s",
	  s: "n",
	  nw: "sw",
	  ne: "se",
	  se: "ne",
	  sw: "nw"
	};

	var signsX = {
	  overlay: +1,
	  selection: +1,
	  n: null,
	  e: +1,
	  s: null,
	  w: -1,
	  nw: -1,
	  ne: +1,
	  se: +1,
	  sw: -1
	};

	var signsY = {
	  overlay: +1,
	  selection: +1,
	  n: -1,
	  e: null,
	  s: +1,
	  w: null,
	  nw: -1,
	  ne: -1,
	  se: +1,
	  sw: +1
	};

	function type(t) {
	  return {type: t};
	}

	// Ignore right-click, since that should open the context menu.
	function defaultFilter() {
	  return !exports.event.button;
	}

	function defaultExtent() {
	  var svg = this.ownerSVGElement || this;
	  return [[0, 0], [svg.width.baseVal.value, svg.height.baseVal.value]];
	}

	// Like d3.local, but with the name “__brush” rather than auto-generated.
	function local$$1(node) {
	  while (!node.__brush) if (!(node = node.parentNode)) return;
	  return node.__brush;
	}

	function empty(extent) {
	  return extent[0][0] === extent[1][0]
	      || extent[0][1] === extent[1][1];
	}

	function brushSelection(node) {
	  var state = node.__brush;
	  return state ? state.dim.output(state.selection) : null;
	}

	function brushX() {
	  return brush$1(X);
	}

	function brushY() {
	  return brush$1(Y);
	}

	var brush = function() {
	  return brush$1(XY);
	};

	function brush$1(dim) {
	  var extent = defaultExtent,
	      filter = defaultFilter,
	      listeners = dispatch(brush, "start", "brush", "end"),
	      handleSize = 6,
	      touchending;

	  function brush(group) {
	    var overlay = group
	        .property("__brush", initialize)
	      .selectAll(".overlay")
	      .data([type("overlay")]);

	    overlay.enter().append("rect")
	        .attr("class", "overlay")
	        .attr("pointer-events", "all")
	        .attr("cursor", cursors.overlay)
	      .merge(overlay)
	        .each(function() {
	          var extent = local$$1(this).extent;
	          select(this)
	              .attr("x", extent[0][0])
	              .attr("y", extent[0][1])
	              .attr("width", extent[1][0] - extent[0][0])
	              .attr("height", extent[1][1] - extent[0][1]);
	        });

	    group.selectAll(".selection")
	      .data([type("selection")])
	      .enter().append("rect")
	        .attr("class", "selection")
	        .attr("cursor", cursors.selection)
	        .attr("fill", "#777")
	        .attr("fill-opacity", 0.3)
	        .attr("stroke", "#fff")
	        .attr("shape-rendering", "crispEdges");

	    var handle = group.selectAll(".handle")
	      .data(dim.handles, function(d) { return d.type; });

	    handle.exit().remove();

	    handle.enter().append("rect")
	        .attr("class", function(d) { return "handle handle--" + d.type; })
	        .attr("cursor", function(d) { return cursors[d.type]; });

	    group
	        .each(redraw)
	        .attr("fill", "none")
	        .attr("pointer-events", "all")
	        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)")
	        .on("mousedown.brush touchstart.brush", started);
	  }

	  brush.move = function(group, selection$$1) {
	    if (group.selection) {
	      group
	          .on("start.brush", function() { emitter(this, arguments).beforestart().start(); })
	          .on("interrupt.brush end.brush", function() { emitter(this, arguments).end(); })
	          .tween("brush", function() {
	            var that = this,
	                state = that.__brush,
	                emit = emitter(that, arguments),
	                selection0 = state.selection,
	                selection1 = dim.input(typeof selection$$1 === "function" ? selection$$1.apply(this, arguments) : selection$$1, state.extent),
	                i = interpolateValue(selection0, selection1);

	            function tween(t) {
	              state.selection = t === 1 && empty(selection1) ? null : i(t);
	              redraw.call(that);
	              emit.brush();
	            }

	            return selection0 && selection1 ? tween : tween(1);
	          });
	    } else {
	      group
	          .each(function() {
	            var that = this,
	                args = arguments,
	                state = that.__brush,
	                selection1 = dim.input(typeof selection$$1 === "function" ? selection$$1.apply(that, args) : selection$$1, state.extent),
	                emit = emitter(that, args).beforestart();

	            interrupt(that);
	            state.selection = selection1 == null || empty(selection1) ? null : selection1;
	            redraw.call(that);
	            emit.start().brush().end();
	          });
	    }
	  };

	  function redraw() {
	    var group = select(this),
	        selection$$1 = local$$1(this).selection;

	    if (selection$$1) {
	      group.selectAll(".selection")
	          .style("display", null)
	          .attr("x", selection$$1[0][0])
	          .attr("y", selection$$1[0][1])
	          .attr("width", selection$$1[1][0] - selection$$1[0][0])
	          .attr("height", selection$$1[1][1] - selection$$1[0][1]);

	      group.selectAll(".handle")
	          .style("display", null)
	          .attr("x", function(d) { return d.type[d.type.length - 1] === "e" ? selection$$1[1][0] - handleSize / 2 : selection$$1[0][0] - handleSize / 2; })
	          .attr("y", function(d) { return d.type[0] === "s" ? selection$$1[1][1] - handleSize / 2 : selection$$1[0][1] - handleSize / 2; })
	          .attr("width", function(d) { return d.type === "n" || d.type === "s" ? selection$$1[1][0] - selection$$1[0][0] + handleSize : handleSize; })
	          .attr("height", function(d) { return d.type === "e" || d.type === "w" ? selection$$1[1][1] - selection$$1[0][1] + handleSize : handleSize; });
	    }

	    else {
	      group.selectAll(".selection,.handle")
	          .style("display", "none")
	          .attr("x", null)
	          .attr("y", null)
	          .attr("width", null)
	          .attr("height", null);
	    }
	  }

	  function emitter(that, args) {
	    return that.__brush.emitter || new Emitter(that, args);
	  }

	  function Emitter(that, args) {
	    this.that = that;
	    this.args = args;
	    this.state = that.__brush;
	    this.active = 0;
	  }

	  Emitter.prototype = {
	    beforestart: function() {
	      if (++this.active === 1) this.state.emitter = this, this.starting = true;
	      return this;
	    },
	    start: function() {
	      if (this.starting) this.starting = false, this.emit("start");
	      return this;
	    },
	    brush: function() {
	      this.emit("brush");
	      return this;
	    },
	    end: function() {
	      if (--this.active === 0) delete this.state.emitter, this.emit("end");
	      return this;
	    },
	    emit: function(type) {
	      customEvent(new BrushEvent(brush, type, dim.output(this.state.selection)), listeners.apply, listeners, [type, this.that, this.args]);
	    }
	  };

	  function started() {
	    if (exports.event.touches) { if (exports.event.changedTouches.length < exports.event.touches.length) return noevent$1(); }
	    else if (touchending) return;
	    if (!filter.apply(this, arguments)) return;

	    var that = this,
	        type = exports.event.target.__data__.type,
	        mode = (exports.event.metaKey ? type = "overlay" : type) === "selection" ? MODE_DRAG : (exports.event.altKey ? MODE_CENTER : MODE_HANDLE),
	        signX = dim === Y ? null : signsX[type],
	        signY = dim === X ? null : signsY[type],
	        state = local$$1(that),
	        extent = state.extent,
	        selection$$1 = state.selection,
	        W = extent[0][0], w0, w1,
	        N = extent[0][1], n0, n1,
	        E = extent[1][0], e0, e1,
	        S = extent[1][1], s0, s1,
	        dx,
	        dy,
	        moving,
	        shifting = signX && signY && exports.event.shiftKey,
	        lockX,
	        lockY,
	        point0 = mouse(that),
	        point = point0,
	        emit = emitter(that, arguments).beforestart();

	    if (type === "overlay") {
	      state.selection = selection$$1 = [
	        [w0 = dim === Y ? W : point0[0], n0 = dim === X ? N : point0[1]],
	        [e0 = dim === Y ? E : w0, s0 = dim === X ? S : n0]
	      ];
	    } else {
	      w0 = selection$$1[0][0];
	      n0 = selection$$1[0][1];
	      e0 = selection$$1[1][0];
	      s0 = selection$$1[1][1];
	    }

	    w1 = w0;
	    n1 = n0;
	    e1 = e0;
	    s1 = s0;

	    var group = select(that)
	        .attr("pointer-events", "none");

	    var overlay = group.selectAll(".overlay")
	        .attr("cursor", cursors[type]);

	    if (exports.event.touches) {
	      group
	          .on("touchmove.brush", moved, true)
	          .on("touchend.brush touchcancel.brush", ended, true);
	    } else {
	      var view = select(exports.event.view)
	          .on("keydown.brush", keydowned, true)
	          .on("keyup.brush", keyupped, true)
	          .on("mousemove.brush", moved, true)
	          .on("mouseup.brush", ended, true);

	      dragDisable(exports.event.view);
	    }

	    nopropagation$1();
	    interrupt(that);
	    redraw.call(that);
	    emit.start();

	    function moved() {
	      var point1 = mouse(that);
	      if (shifting && !lockX && !lockY) {
	        if (Math.abs(point1[0] - point[0]) > Math.abs(point1[1] - point[1])) lockY = true;
	        else lockX = true;
	      }
	      point = point1;
	      moving = true;
	      noevent$1();
	      move();
	    }

	    function move() {
	      var t;

	      dx = point[0] - point0[0];
	      dy = point[1] - point0[1];

	      switch (mode) {
	        case MODE_SPACE:
	        case MODE_DRAG: {
	          if (signX) dx = Math.max(W - w0, Math.min(E - e0, dx)), w1 = w0 + dx, e1 = e0 + dx;
	          if (signY) dy = Math.max(N - n0, Math.min(S - s0, dy)), n1 = n0 + dy, s1 = s0 + dy;
	          break;
	        }
	        case MODE_HANDLE: {
	          if (signX < 0) dx = Math.max(W - w0, Math.min(E - w0, dx)), w1 = w0 + dx, e1 = e0;
	          else if (signX > 0) dx = Math.max(W - e0, Math.min(E - e0, dx)), w1 = w0, e1 = e0 + dx;
	          if (signY < 0) dy = Math.max(N - n0, Math.min(S - n0, dy)), n1 = n0 + dy, s1 = s0;
	          else if (signY > 0) dy = Math.max(N - s0, Math.min(S - s0, dy)), n1 = n0, s1 = s0 + dy;
	          break;
	        }
	        case MODE_CENTER: {
	          if (signX) w1 = Math.max(W, Math.min(E, w0 - dx * signX)), e1 = Math.max(W, Math.min(E, e0 + dx * signX));
	          if (signY) n1 = Math.max(N, Math.min(S, n0 - dy * signY)), s1 = Math.max(N, Math.min(S, s0 + dy * signY));
	          break;
	        }
	      }

	      if (e1 < w1) {
	        signX *= -1;
	        t = w0, w0 = e0, e0 = t;
	        t = w1, w1 = e1, e1 = t;
	        if (type in flipX) overlay.attr("cursor", cursors[type = flipX[type]]);
	      }

	      if (s1 < n1) {
	        signY *= -1;
	        t = n0, n0 = s0, s0 = t;
	        t = n1, n1 = s1, s1 = t;
	        if (type in flipY) overlay.attr("cursor", cursors[type = flipY[type]]);
	      }

	      if (state.selection) selection$$1 = state.selection; // May be set by brush.move!
	      if (lockX) w1 = selection$$1[0][0], e1 = selection$$1[1][0];
	      if (lockY) n1 = selection$$1[0][1], s1 = selection$$1[1][1];

	      if (selection$$1[0][0] !== w1
	          || selection$$1[0][1] !== n1
	          || selection$$1[1][0] !== e1
	          || selection$$1[1][1] !== s1) {
	        state.selection = [[w1, n1], [e1, s1]];
	        redraw.call(that);
	        emit.brush();
	      }
	    }

	    function ended() {
	      nopropagation$1();
	      if (exports.event.touches) {
	        if (exports.event.touches.length) return;
	        if (touchending) clearTimeout(touchending);
	        touchending = setTimeout(function() { touchending = null; }, 500); // Ghost clicks are delayed!
	        group.on("touchmove.brush touchend.brush touchcancel.brush", null);
	      } else {
	        yesdrag(exports.event.view, moving);
	        view.on("keydown.brush keyup.brush mousemove.brush mouseup.brush", null);
	      }
	      group.attr("pointer-events", "all");
	      overlay.attr("cursor", cursors.overlay);
	      if (state.selection) selection$$1 = state.selection; // May be set by brush.move (on start)!
	      if (empty(selection$$1)) state.selection = null, redraw.call(that);
	      emit.end();
	    }

	    function keydowned() {
	      switch (exports.event.keyCode) {
	        case 16: { // SHIFT
	          shifting = signX && signY;
	          break;
	        }
	        case 18: { // ALT
	          if (mode === MODE_HANDLE) {
	            if (signX) e0 = e1 - dx * signX, w0 = w1 + dx * signX;
	            if (signY) s0 = s1 - dy * signY, n0 = n1 + dy * signY;
	            mode = MODE_CENTER;
	            move();
	          }
	          break;
	        }
	        case 32: { // SPACE; takes priority over ALT
	          if (mode === MODE_HANDLE || mode === MODE_CENTER) {
	            if (signX < 0) e0 = e1 - dx; else if (signX > 0) w0 = w1 - dx;
	            if (signY < 0) s0 = s1 - dy; else if (signY > 0) n0 = n1 - dy;
	            mode = MODE_SPACE;
	            overlay.attr("cursor", cursors.selection);
	            move();
	          }
	          break;
	        }
	        default: return;
	      }
	      noevent$1();
	    }

	    function keyupped() {
	      switch (exports.event.keyCode) {
	        case 16: { // SHIFT
	          if (shifting) {
	            lockX = lockY = shifting = false;
	            move();
	          }
	          break;
	        }
	        case 18: { // ALT
	          if (mode === MODE_CENTER) {
	            if (signX < 0) e0 = e1; else if (signX > 0) w0 = w1;
	            if (signY < 0) s0 = s1; else if (signY > 0) n0 = n1;
	            mode = MODE_HANDLE;
	            move();
	          }
	          break;
	        }
	        case 32: { // SPACE
	          if (mode === MODE_SPACE) {
	            if (exports.event.altKey) {
	              if (signX) e0 = e1 - dx * signX, w0 = w1 + dx * signX;
	              if (signY) s0 = s1 - dy * signY, n0 = n1 + dy * signY;
	              mode = MODE_CENTER;
	            } else {
	              if (signX < 0) e0 = e1; else if (signX > 0) w0 = w1;
	              if (signY < 0) s0 = s1; else if (signY > 0) n0 = n1;
	              mode = MODE_HANDLE;
	            }
	            overlay.attr("cursor", cursors[type]);
	            move();
	          }
	          break;
	        }
	        default: return;
	      }
	      noevent$1();
	    }
	  }

	  function initialize() {
	    var state = this.__brush || {selection: null};
	    state.extent = extent.apply(this, arguments);
	    state.dim = dim;
	    return state;
	  }

	  brush.extent = function(_) {
	    return arguments.length ? (extent = typeof _ === "function" ? _ : constant$4([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), brush) : extent;
	  };

	  brush.filter = function(_) {
	    return arguments.length ? (filter = typeof _ === "function" ? _ : constant$4(!!_), brush) : filter;
	  };

	  brush.handleSize = function(_) {
	    return arguments.length ? (handleSize = +_, brush) : handleSize;
	  };

	  brush.on = function() {
	    var value = listeners.on.apply(listeners, arguments);
	    return value === listeners ? brush : value;
	  };

	  return brush;
	}

	var cos = Math.cos;
	var sin = Math.sin;
	var pi$1 = Math.PI;
	var halfPi$1 = pi$1 / 2;
	var tau$1 = pi$1 * 2;
	var max$1 = Math.max;

	function compareValue(compare) {
	  return function(a, b) {
	    return compare(
	      a.source.value + a.target.value,
	      b.source.value + b.target.value
	    );
	  };
	}

	var chord = function() {
	  var padAngle = 0,
	      sortGroups = null,
	      sortSubgroups = null,
	      sortChords = null;

	  function chord(matrix) {
	    var n = matrix.length,
	        groupSums = [],
	        groupIndex = sequence(n),
	        subgroupIndex = [],
	        chords = [],
	        groups = chords.groups = new Array(n),
	        subgroups = new Array(n * n),
	        k,
	        x,
	        x0,
	        dx,
	        i,
	        j;

	    // Compute the sum.
	    k = 0, i = -1; while (++i < n) {
	      x = 0, j = -1; while (++j < n) {
	        x += matrix[i][j];
	      }
	      groupSums.push(x);
	      subgroupIndex.push(sequence(n));
	      k += x;
	    }

	    // Sort groups…
	    if (sortGroups) groupIndex.sort(function(a, b) {
	      return sortGroups(groupSums[a], groupSums[b]);
	    });

	    // Sort subgroups…
	    if (sortSubgroups) subgroupIndex.forEach(function(d, i) {
	      d.sort(function(a, b) {
	        return sortSubgroups(matrix[i][a], matrix[i][b]);
	      });
	    });

	    // Convert the sum to scaling factor for [0, 2pi].
	    // TODO Allow start and end angle to be specified?
	    // TODO Allow padding to be specified as percentage?
	    k = max$1(0, tau$1 - padAngle * n) / k;
	    dx = k ? padAngle : tau$1 / n;

	    // Compute the start and end angle for each group and subgroup.
	    // Note: Opera has a bug reordering object literal properties!
	    x = 0, i = -1; while (++i < n) {
	      x0 = x, j = -1; while (++j < n) {
	        var di = groupIndex[i],
	            dj = subgroupIndex[di][j],
	            v = matrix[di][dj],
	            a0 = x,
	            a1 = x += v * k;
	        subgroups[dj * n + di] = {
	          index: di,
	          subindex: dj,
	          startAngle: a0,
	          endAngle: a1,
	          value: v
	        };
	      }
	      groups[di] = {
	        index: di,
	        startAngle: x0,
	        endAngle: x,
	        value: groupSums[di]
	      };
	      x += dx;
	    }

	    // Generate chords for each (non-empty) subgroup-subgroup link.
	    i = -1; while (++i < n) {
	      j = i - 1; while (++j < n) {
	        var source = subgroups[j * n + i],
	            target = subgroups[i * n + j];
	        if (source.value || target.value) {
	          chords.push(source.value < target.value
	              ? {source: target, target: source}
	              : {source: source, target: target});
	        }
	      }
	    }

	    return sortChords ? chords.sort(sortChords) : chords;
	  }

	  chord.padAngle = function(_) {
	    return arguments.length ? (padAngle = max$1(0, _), chord) : padAngle;
	  };

	  chord.sortGroups = function(_) {
	    return arguments.length ? (sortGroups = _, chord) : sortGroups;
	  };

	  chord.sortSubgroups = function(_) {
	    return arguments.length ? (sortSubgroups = _, chord) : sortSubgroups;
	  };

	  chord.sortChords = function(_) {
	    return arguments.length ? (_ == null ? sortChords = null : (sortChords = compareValue(_))._ = _, chord) : sortChords && sortChords._;
	  };

	  return chord;
	};

	var slice$2 = Array.prototype.slice;

	var constant$5 = function(x) {
	  return function() {
	    return x;
	  };
	};

	var pi$2 = Math.PI;
	var tau$2 = 2 * pi$2;
	var epsilon$1 = 1e-6;
	var tauEpsilon = tau$2 - epsilon$1;

	function Path() {
	  this._x0 = this._y0 = // start of current subpath
	  this._x1 = this._y1 = null; // end of current subpath
	  this._ = "";
	}

	function path() {
	  return new Path;
	}

	Path.prototype = path.prototype = {
	  constructor: Path,
	  moveTo: function(x, y) {
	    this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
	  },
	  closePath: function() {
	    if (this._x1 !== null) {
	      this._x1 = this._x0, this._y1 = this._y0;
	      this._ += "Z";
	    }
	  },
	  lineTo: function(x, y) {
	    this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
	  },
	  quadraticCurveTo: function(x1, y1, x, y) {
	    this._ += "Q" + (+x1) + "," + (+y1) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
	  },
	  bezierCurveTo: function(x1, y1, x2, y2, x, y) {
	    this._ += "C" + (+x1) + "," + (+y1) + "," + (+x2) + "," + (+y2) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
	  },
	  arcTo: function(x1, y1, x2, y2, r) {
	    x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
	    var x0 = this._x1,
	        y0 = this._y1,
	        x21 = x2 - x1,
	        y21 = y2 - y1,
	        x01 = x0 - x1,
	        y01 = y0 - y1,
	        l01_2 = x01 * x01 + y01 * y01;

	    // Is the radius negative? Error.
	    if (r < 0) throw new Error("negative radius: " + r);

	    // Is this path empty? Move to (x1,y1).
	    if (this._x1 === null) {
	      this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
	    }

	    // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
	    else if (!(l01_2 > epsilon$1)) {}

	    // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
	    // Equivalently, is (x1,y1) coincident with (x2,y2)?
	    // Or, is the radius zero? Line to (x1,y1).
	    else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon$1) || !r) {
	      this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
	    }

	    // Otherwise, draw an arc!
	    else {
	      var x20 = x2 - x0,
	          y20 = y2 - y0,
	          l21_2 = x21 * x21 + y21 * y21,
	          l20_2 = x20 * x20 + y20 * y20,
	          l21 = Math.sqrt(l21_2),
	          l01 = Math.sqrt(l01_2),
	          l = r * Math.tan((pi$2 - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
	          t01 = l / l01,
	          t21 = l / l21;

	      // If the start tangent is not coincident with (x0,y0), line to.
	      if (Math.abs(t01 - 1) > epsilon$1) {
	        this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
	      }

	      this._ += "A" + r + "," + r + ",0,0," + (+(y01 * x20 > x01 * y20)) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
	    }
	  },
	  arc: function(x, y, r, a0, a1, ccw) {
	    x = +x, y = +y, r = +r;
	    var dx = r * Math.cos(a0),
	        dy = r * Math.sin(a0),
	        x0 = x + dx,
	        y0 = y + dy,
	        cw = 1 ^ ccw,
	        da = ccw ? a0 - a1 : a1 - a0;

	    // Is the radius negative? Error.
	    if (r < 0) throw new Error("negative radius: " + r);

	    // Is this path empty? Move to (x0,y0).
	    if (this._x1 === null) {
	      this._ += "M" + x0 + "," + y0;
	    }

	    // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
	    else if (Math.abs(this._x1 - x0) > epsilon$1 || Math.abs(this._y1 - y0) > epsilon$1) {
	      this._ += "L" + x0 + "," + y0;
	    }

	    // Is this arc empty? We’re done.
	    if (!r) return;

	    // Does the angle go the wrong way? Flip the direction.
	    if (da < 0) da = da % tau$2 + tau$2;

	    // Is this a complete circle? Draw two arcs to complete the circle.
	    if (da > tauEpsilon) {
	      this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
	    }

	    // Is this arc non-empty? Draw an arc!
	    else if (da > epsilon$1) {
	      this._ += "A" + r + "," + r + ",0," + (+(da >= pi$2)) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
	    }
	  },
	  rect: function(x, y, w, h) {
	    this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + (+w) + "v" + (+h) + "h" + (-w) + "Z";
	  },
	  toString: function() {
	    return this._;
	  }
	};

	function defaultSource(d) {
	  return d.source;
	}

	function defaultTarget(d) {
	  return d.target;
	}

	function defaultRadius(d) {
	  return d.radius;
	}

	function defaultStartAngle(d) {
	  return d.startAngle;
	}

	function defaultEndAngle(d) {
	  return d.endAngle;
	}

	var ribbon = function() {
	  var source = defaultSource,
	      target = defaultTarget,
	      radius = defaultRadius,
	      startAngle = defaultStartAngle,
	      endAngle = defaultEndAngle,
	      context = null;

	  function ribbon() {
	    var buffer,
	        argv = slice$2.call(arguments),
	        s = source.apply(this, argv),
	        t = target.apply(this, argv),
	        sr = +radius.apply(this, (argv[0] = s, argv)),
	        sa0 = startAngle.apply(this, argv) - halfPi$1,
	        sa1 = endAngle.apply(this, argv) - halfPi$1,
	        sx0 = sr * cos(sa0),
	        sy0 = sr * sin(sa0),
	        tr = +radius.apply(this, (argv[0] = t, argv)),
	        ta0 = startAngle.apply(this, argv) - halfPi$1,
	        ta1 = endAngle.apply(this, argv) - halfPi$1;

	    if (!context) context = buffer = path();

	    context.moveTo(sx0, sy0);
	    context.arc(0, 0, sr, sa0, sa1);
	    if (sa0 !== ta0 || sa1 !== ta1) { // TODO sr !== tr?
	      context.quadraticCurveTo(0, 0, tr * cos(ta0), tr * sin(ta0));
	      context.arc(0, 0, tr, ta0, ta1);
	    }
	    context.quadraticCurveTo(0, 0, sx0, sy0);
	    context.closePath();

	    if (buffer) return context = null, buffer + "" || null;
	  }

	  ribbon.radius = function(_) {
	    return arguments.length ? (radius = typeof _ === "function" ? _ : constant$5(+_), ribbon) : radius;
	  };

	  ribbon.startAngle = function(_) {
	    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant$5(+_), ribbon) : startAngle;
	  };

	  ribbon.endAngle = function(_) {
	    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant$5(+_), ribbon) : endAngle;
	  };

	  ribbon.source = function(_) {
	    return arguments.length ? (source = _, ribbon) : source;
	  };

	  ribbon.target = function(_) {
	    return arguments.length ? (target = _, ribbon) : target;
	  };

	  ribbon.context = function(_) {
	    return arguments.length ? ((context = _ == null ? null : _), ribbon) : context;
	  };

	  return ribbon;
	};

	var prefix = "$";

	function Map() {}

	Map.prototype = map$1.prototype = {
	  constructor: Map,
	  has: function(key) {
	    return (prefix + key) in this;
	  },
	  get: function(key) {
	    return this[prefix + key];
	  },
	  set: function(key, value) {
	    this[prefix + key] = value;
	    return this;
	  },
	  remove: function(key) {
	    var property = prefix + key;
	    return property in this && delete this[property];
	  },
	  clear: function() {
	    for (var property in this) if (property[0] === prefix) delete this[property];
	  },
	  keys: function() {
	    var keys = [];
	    for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
	    return keys;
	  },
	  values: function() {
	    var values = [];
	    for (var property in this) if (property[0] === prefix) values.push(this[property]);
	    return values;
	  },
	  entries: function() {
	    var entries = [];
	    for (var property in this) if (property[0] === prefix) entries.push({key: property.slice(1), value: this[property]});
	    return entries;
	  },
	  size: function() {
	    var size = 0;
	    for (var property in this) if (property[0] === prefix) ++size;
	    return size;
	  },
	  empty: function() {
	    for (var property in this) if (property[0] === prefix) return false;
	    return true;
	  },
	  each: function(f) {
	    for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
	  }
	};

	function map$1(object, f) {
	  var map = new Map;

	  // Copy constructor.
	  if (object instanceof Map) object.each(function(value, key) { map.set(key, value); });

	  // Index array by numeric index or specified key function.
	  else if (Array.isArray(object)) {
	    var i = -1,
	        n = object.length,
	        o;

	    if (f == null) while (++i < n) map.set(i, object[i]);
	    else while (++i < n) map.set(f(o = object[i], i, object), o);
	  }

	  // Convert object to map.
	  else if (object) for (var key in object) map.set(key, object[key]);

	  return map;
	}

	var nest = function() {
	  var keys = [],
	      sortKeys = [],
	      sortValues,
	      rollup,
	      nest;

	  function apply(array, depth, createResult, setResult) {
	    if (depth >= keys.length) return rollup != null
	        ? rollup(array) : (sortValues != null
	        ? array.sort(sortValues)
	        : array);

	    var i = -1,
	        n = array.length,
	        key = keys[depth++],
	        keyValue,
	        value,
	        valuesByKey = map$1(),
	        values,
	        result = createResult();

	    while (++i < n) {
	      if (values = valuesByKey.get(keyValue = key(value = array[i]) + "")) {
	        values.push(value);
	      } else {
	        valuesByKey.set(keyValue, [value]);
	      }
	    }

	    valuesByKey.each(function(values, key) {
	      setResult(result, key, apply(values, depth, createResult, setResult));
	    });

	    return result;
	  }

	  function entries(map, depth) {
	    if (++depth > keys.length) return map;
	    var array, sortKey = sortKeys[depth - 1];
	    if (rollup != null && depth >= keys.length) array = map.entries();
	    else array = [], map.each(function(v, k) { array.push({key: k, values: entries(v, depth)}); });
	    return sortKey != null ? array.sort(function(a, b) { return sortKey(a.key, b.key); }) : array;
	  }

	  return nest = {
	    object: function(array) { return apply(array, 0, createObject, setObject); },
	    map: function(array) { return apply(array, 0, createMap, setMap); },
	    entries: function(array) { return entries(apply(array, 0, createMap, setMap), 0); },
	    key: function(d) { keys.push(d); return nest; },
	    sortKeys: function(order) { sortKeys[keys.length - 1] = order; return nest; },
	    sortValues: function(order) { sortValues = order; return nest; },
	    rollup: function(f) { rollup = f; return nest; }
	  };
	};

	function createObject() {
	  return {};
	}

	function setObject(object, key, value) {
	  object[key] = value;
	}

	function createMap() {
	  return map$1();
	}

	function setMap(map, key, value) {
	  map.set(key, value);
	}

	function Set() {}

	var proto = map$1.prototype;

	Set.prototype = set$2.prototype = {
	  constructor: Set,
	  has: proto.has,
	  add: function(value) {
	    value += "";
	    this[prefix + value] = value;
	    return this;
	  },
	  remove: proto.remove,
	  clear: proto.clear,
	  values: proto.keys,
	  size: proto.size,
	  empty: proto.empty,
	  each: proto.each
	};

	function set$2(object, f) {
	  var set = new Set;

	  // Copy constructor.
	  if (object instanceof Set) object.each(function(value) { set.add(value); });

	  // Otherwise, assume it’s an array.
	  else if (object) {
	    var i = -1, n = object.length;
	    if (f == null) while (++i < n) set.add(object[i]);
	    else while (++i < n) set.add(f(object[i], i, object));
	  }

	  return set;
	}

	var keys = function(map) {
	  var keys = [];
	  for (var key in map) keys.push(key);
	  return keys;
	};

	var values = function(map) {
	  var values = [];
	  for (var key in map) values.push(map[key]);
	  return values;
	};

	var entries = function(map) {
	  var entries = [];
	  for (var key in map) entries.push({key: key, value: map[key]});
	  return entries;
	};

	function objectConverter(columns) {
	  return new Function("d", "return {" + columns.map(function(name, i) {
	    return JSON.stringify(name) + ": d[" + i + "]";
	  }).join(",") + "}");
	}

	function customConverter(columns, f) {
	  var object = objectConverter(columns);
	  return function(row, i) {
	    return f(object(row), i, columns);
	  };
	}

	// Compute unique columns in order of discovery.
	function inferColumns(rows) {
	  var columnSet = Object.create(null),
	      columns = [];

	  rows.forEach(function(row) {
	    for (var column in row) {
	      if (!(column in columnSet)) {
	        columns.push(columnSet[column] = column);
	      }
	    }
	  });

	  return columns;
	}

	var dsv = function(delimiter) {
	  var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
	      delimiterCode = delimiter.charCodeAt(0);

	  function parse(text, f) {
	    var convert, columns, rows = parseRows(text, function(row, i) {
	      if (convert) return convert(row, i - 1);
	      columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
	    });
	    rows.columns = columns;
	    return rows;
	  }

	  function parseRows(text, f) {
	    var EOL = {}, // sentinel value for end-of-line
	        EOF = {}, // sentinel value for end-of-file
	        rows = [], // output rows
	        N = text.length,
	        I = 0, // current character index
	        n = 0, // the current line number
	        t, // the current token
	        eol; // is the current token followed by EOL?

	    function token() {
	      if (I >= N) return EOF; // special case: end of file
	      if (eol) return eol = false, EOL; // special case: end of line

	      // special case: quotes
	      var j = I, c;
	      if (text.charCodeAt(j) === 34) {
	        var i = j;
	        while (i++ < N) {
	          if (text.charCodeAt(i) === 34) {
	            if (text.charCodeAt(i + 1) !== 34) break;
	            ++i;
	          }
	        }
	        I = i + 2;
	        c = text.charCodeAt(i + 1);
	        if (c === 13) {
	          eol = true;
	          if (text.charCodeAt(i + 2) === 10) ++I;
	        } else if (c === 10) {
	          eol = true;
	        }
	        return text.slice(j + 1, i).replace(/""/g, "\"");
	      }

	      // common case: find next delimiter or newline
	      while (I < N) {
	        var k = 1;
	        c = text.charCodeAt(I++);
	        if (c === 10) eol = true; // \n
	        else if (c === 13) { eol = true; if (text.charCodeAt(I) === 10) ++I, ++k; } // \r|\r\n
	        else if (c !== delimiterCode) continue;
	        return text.slice(j, I - k);
	      }

	      // special case: last token before EOF
	      return text.slice(j);
	    }

	    while ((t = token()) !== EOF) {
	      var a = [];
	      while (t !== EOL && t !== EOF) {
	        a.push(t);
	        t = token();
	      }
	      if (f && (a = f(a, n++)) == null) continue;
	      rows.push(a);
	    }

	    return rows;
	  }

	  function format(rows, columns) {
	    if (columns == null) columns = inferColumns(rows);
	    return [columns.map(formatValue).join(delimiter)].concat(rows.map(function(row) {
	      return columns.map(function(column) {
	        return formatValue(row[column]);
	      }).join(delimiter);
	    })).join("\n");
	  }

	  function formatRows(rows) {
	    return rows.map(formatRow).join("\n");
	  }

	  function formatRow(row) {
	    return row.map(formatValue).join(delimiter);
	  }

	  function formatValue(text) {
	    return text == null ? ""
	        : reFormat.test(text += "") ? "\"" + text.replace(/\"/g, "\"\"") + "\""
	        : text;
	  }

	  return {
	    parse: parse,
	    parseRows: parseRows,
	    format: format,
	    formatRows: formatRows
	  };
	};

	var csv = dsv(",");

	var csvParse = csv.parse;
	var csvParseRows = csv.parseRows;
	var csvFormat = csv.format;
	var csvFormatRows = csv.formatRows;

	var tsv = dsv("\t");

	var tsvParse = tsv.parse;
	var tsvParseRows = tsv.parseRows;
	var tsvFormat = tsv.format;
	var tsvFormatRows = tsv.formatRows;

	var center$1 = function(x, y) {
	  var nodes;

	  if (x == null) x = 0;
	  if (y == null) y = 0;

	  function force() {
	    var i,
	        n = nodes.length,
	        node,
	        sx = 0,
	        sy = 0;

	    for (i = 0; i < n; ++i) {
	      node = nodes[i], sx += node.x, sy += node.y;
	    }

	    for (sx = sx / n - x, sy = sy / n - y, i = 0; i < n; ++i) {
	      node = nodes[i], node.x -= sx, node.y -= sy;
	    }
	  }

	  force.initialize = function(_) {
	    nodes = _;
	  };

	  force.x = function(_) {
	    return arguments.length ? (x = +_, force) : x;
	  };

	  force.y = function(_) {
	    return arguments.length ? (y = +_, force) : y;
	  };

	  return force;
	};

	var constant$6 = function(x) {
	  return function() {
	    return x;
	  };
	};

	var jiggle = function() {
	  return (Math.random() - 0.5) * 1e-6;
	};

	var tree_add = function(d) {
	  var x = +this._x.call(null, d),
	      y = +this._y.call(null, d);
	  return add(this.cover(x, y), x, y, d);
	};

	function add(tree, x, y, d) {
	  if (isNaN(x) || isNaN(y)) return tree; // ignore invalid points

	  var parent,
	      node = tree._root,
	      leaf = {data: d},
	      x0 = tree._x0,
	      y0 = tree._y0,
	      x1 = tree._x1,
	      y1 = tree._y1,
	      xm,
	      ym,
	      xp,
	      yp,
	      right,
	      bottom,
	      i,
	      j;

	  // If the tree is empty, initialize the root as a leaf.
	  if (!node) return tree._root = leaf, tree;

	  // Find the existing leaf for the new point, or add it.
	  while (node.length) {
	    if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
	    if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
	    if (parent = node, !(node = node[i = bottom << 1 | right])) return parent[i] = leaf, tree;
	  }

	  // Is the new point is exactly coincident with the existing point?
	  xp = +tree._x.call(null, node.data);
	  yp = +tree._y.call(null, node.data);
	  if (x === xp && y === yp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;

	  // Otherwise, split the leaf node until the old and new point are separated.
	  do {
	    parent = parent ? parent[i] = new Array(4) : tree._root = new Array(4);
	    if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
	    if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
	  } while ((i = bottom << 1 | right) === (j = (yp >= ym) << 1 | (xp >= xm)));
	  return parent[j] = node, parent[i] = leaf, tree;
	}

	function addAll(data) {
	  var d, i, n = data.length,
	      x,
	      y,
	      xz = new Array(n),
	      yz = new Array(n),
	      x0 = Infinity,
	      y0 = Infinity,
	      x1 = -Infinity,
	      y1 = -Infinity;

	  // Compute the points and their extent.
	  for (i = 0; i < n; ++i) {
	    if (isNaN(x = +this._x.call(null, d = data[i])) || isNaN(y = +this._y.call(null, d))) continue;
	    xz[i] = x;
	    yz[i] = y;
	    if (x < x0) x0 = x;
	    if (x > x1) x1 = x;
	    if (y < y0) y0 = y;
	    if (y > y1) y1 = y;
	  }

	  // If there were no (valid) points, inherit the existing extent.
	  if (x1 < x0) x0 = this._x0, x1 = this._x1;
	  if (y1 < y0) y0 = this._y0, y1 = this._y1;

	  // Expand the tree to cover the new points.
	  this.cover(x0, y0).cover(x1, y1);

	  // Add the new points.
	  for (i = 0; i < n; ++i) {
	    add(this, xz[i], yz[i], data[i]);
	  }

	  return this;
	}

	var tree_cover = function(x, y) {
	  if (isNaN(x = +x) || isNaN(y = +y)) return this; // ignore invalid points

	  var x0 = this._x0,
	      y0 = this._y0,
	      x1 = this._x1,
	      y1 = this._y1;

	  // If the quadtree has no extent, initialize them.
	  // Integer extent are necessary so that if we later double the extent,
	  // the existing quadrant boundaries don’t change due to floating point error!
	  if (isNaN(x0)) {
	    x1 = (x0 = Math.floor(x)) + 1;
	    y1 = (y0 = Math.floor(y)) + 1;
	  }

	  // Otherwise, double repeatedly to cover.
	  else if (x0 > x || x > x1 || y0 > y || y > y1) {
	    var z = x1 - x0,
	        node = this._root,
	        parent,
	        i;

	    switch (i = (y < (y0 + y1) / 2) << 1 | (x < (x0 + x1) / 2)) {
	      case 0: {
	        do parent = new Array(4), parent[i] = node, node = parent;
	        while (z *= 2, x1 = x0 + z, y1 = y0 + z, x > x1 || y > y1);
	        break;
	      }
	      case 1: {
	        do parent = new Array(4), parent[i] = node, node = parent;
	        while (z *= 2, x0 = x1 - z, y1 = y0 + z, x0 > x || y > y1);
	        break;
	      }
	      case 2: {
	        do parent = new Array(4), parent[i] = node, node = parent;
	        while (z *= 2, x1 = x0 + z, y0 = y1 - z, x > x1 || y0 > y);
	        break;
	      }
	      case 3: {
	        do parent = new Array(4), parent[i] = node, node = parent;
	        while (z *= 2, x0 = x1 - z, y0 = y1 - z, x0 > x || y0 > y);
	        break;
	      }
	    }

	    if (this._root && this._root.length) this._root = node;
	  }

	  // If the quadtree covers the point already, just return.
	  else return this;

	  this._x0 = x0;
	  this._y0 = y0;
	  this._x1 = x1;
	  this._y1 = y1;
	  return this;
	};

	var tree_data = function() {
	  var data = [];
	  this.visit(function(node) {
	    if (!node.length) do data.push(node.data); while (node = node.next)
	  });
	  return data;
	};

	var tree_extent = function(_) {
	  return arguments.length
	      ? this.cover(+_[0][0], +_[0][1]).cover(+_[1][0], +_[1][1])
	      : isNaN(this._x0) ? undefined : [[this._x0, this._y0], [this._x1, this._y1]];
	};

	var Quad = function(node, x0, y0, x1, y1) {
	  this.node = node;
	  this.x0 = x0;
	  this.y0 = y0;
	  this.x1 = x1;
	  this.y1 = y1;
	};

	var tree_find = function(x, y, radius) {
	  var data,
	      x0 = this._x0,
	      y0 = this._y0,
	      x1,
	      y1,
	      x2,
	      y2,
	      x3 = this._x1,
	      y3 = this._y1,
	      quads = [],
	      node = this._root,
	      q,
	      i;

	  if (node) quads.push(new Quad(node, x0, y0, x3, y3));
	  if (radius == null) radius = Infinity;
	  else {
	    x0 = x - radius, y0 = y - radius;
	    x3 = x + radius, y3 = y + radius;
	    radius *= radius;
	  }

	  while (q = quads.pop()) {

	    // Stop searching if this quadrant can’t contain a closer node.
	    if (!(node = q.node)
	        || (x1 = q.x0) > x3
	        || (y1 = q.y0) > y3
	        || (x2 = q.x1) < x0
	        || (y2 = q.y1) < y0) continue;

	    // Bisect the current quadrant.
	    if (node.length) {
	      var xm = (x1 + x2) / 2,
	          ym = (y1 + y2) / 2;

	      quads.push(
	        new Quad(node[3], xm, ym, x2, y2),
	        new Quad(node[2], x1, ym, xm, y2),
	        new Quad(node[1], xm, y1, x2, ym),
	        new Quad(node[0], x1, y1, xm, ym)
	      );

	      // Visit the closest quadrant first.
	      if (i = (y >= ym) << 1 | (x >= xm)) {
	        q = quads[quads.length - 1];
	        quads[quads.length - 1] = quads[quads.length - 1 - i];
	        quads[quads.length - 1 - i] = q;
	      }
	    }

	    // Visit this point. (Visiting coincident points isn’t necessary!)
	    else {
	      var dx = x - +this._x.call(null, node.data),
	          dy = y - +this._y.call(null, node.data),
	          d2 = dx * dx + dy * dy;
	      if (d2 < radius) {
	        var d = Math.sqrt(radius = d2);
	        x0 = x - d, y0 = y - d;
	        x3 = x + d, y3 = y + d;
	        data = node.data;
	      }
	    }
	  }

	  return data;
	};

	var tree_remove = function(d) {
	  if (isNaN(x = +this._x.call(null, d)) || isNaN(y = +this._y.call(null, d))) return this; // ignore invalid points

	  var parent,
	      node = this._root,
	      retainer,
	      previous,
	      next,
	      x0 = this._x0,
	      y0 = this._y0,
	      x1 = this._x1,
	      y1 = this._y1,
	      x,
	      y,
	      xm,
	      ym,
	      right,
	      bottom,
	      i,
	      j;

	  // If the tree is empty, initialize the root as a leaf.
	  if (!node) return this;

	  // Find the leaf node for the point.
	  // While descending, also retain the deepest parent with a non-removed sibling.
	  if (node.length) while (true) {
	    if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
	    if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
	    if (!(parent = node, node = node[i = bottom << 1 | right])) return this;
	    if (!node.length) break;
	    if (parent[(i + 1) & 3] || parent[(i + 2) & 3] || parent[(i + 3) & 3]) retainer = parent, j = i;
	  }

	  // Find the point to remove.
	  while (node.data !== d) if (!(previous = node, node = node.next)) return this;
	  if (next = node.next) delete node.next;

	  // If there are multiple coincident points, remove just the point.
	  if (previous) return (next ? previous.next = next : delete previous.next), this;

	  // If this is the root point, remove it.
	  if (!parent) return this._root = next, this;

	  // Remove this leaf.
	  next ? parent[i] = next : delete parent[i];

	  // If the parent now contains exactly one leaf, collapse superfluous parents.
	  if ((node = parent[0] || parent[1] || parent[2] || parent[3])
	      && node === (parent[3] || parent[2] || parent[1] || parent[0])
	      && !node.length) {
	    if (retainer) retainer[j] = node;
	    else this._root = node;
	  }

	  return this;
	};

	function removeAll(data) {
	  for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
	  return this;
	}

	var tree_root = function() {
	  return this._root;
	};

	var tree_size = function() {
	  var size = 0;
	  this.visit(function(node) {
	    if (!node.length) do ++size; while (node = node.next)
	  });
	  return size;
	};

	var tree_visit = function(callback) {
	  var quads = [], q, node = this._root, child, x0, y0, x1, y1;
	  if (node) quads.push(new Quad(node, this._x0, this._y0, this._x1, this._y1));
	  while (q = quads.pop()) {
	    if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && node.length) {
	      var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
	      if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
	      if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
	      if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
	      if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
	    }
	  }
	  return this;
	};

	var tree_visitAfter = function(callback) {
	  var quads = [], next = [], q;
	  if (this._root) quads.push(new Quad(this._root, this._x0, this._y0, this._x1, this._y1));
	  while (q = quads.pop()) {
	    var node = q.node;
	    if (node.length) {
	      var child, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
	      if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
	      if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
	      if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
	      if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
	    }
	    next.push(q);
	  }
	  while (q = next.pop()) {
	    callback(q.node, q.x0, q.y0, q.x1, q.y1);
	  }
	  return this;
	};

	function defaultX(d) {
	  return d[0];
	}

	var tree_x = function(_) {
	  return arguments.length ? (this._x = _, this) : this._x;
	};

	function defaultY(d) {
	  return d[1];
	}

	var tree_y = function(_) {
	  return arguments.length ? (this._y = _, this) : this._y;
	};

	function quadtree(nodes, x, y) {
	  var tree = new Quadtree(x == null ? defaultX : x, y == null ? defaultY : y, NaN, NaN, NaN, NaN);
	  return nodes == null ? tree : tree.addAll(nodes);
	}

	function Quadtree(x, y, x0, y0, x1, y1) {
	  this._x = x;
	  this._y = y;
	  this._x0 = x0;
	  this._y0 = y0;
	  this._x1 = x1;
	  this._y1 = y1;
	  this._root = undefined;
	}

	function leaf_copy(leaf) {
	  var copy = {data: leaf.data}, next = copy;
	  while (leaf = leaf.next) next = next.next = {data: leaf.data};
	  return copy;
	}

	var treeProto = quadtree.prototype = Quadtree.prototype;

	treeProto.copy = function() {
	  var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1),
	      node = this._root,
	      nodes,
	      child;

	  if (!node) return copy;

	  if (!node.length) return copy._root = leaf_copy(node), copy;

	  nodes = [{source: node, target: copy._root = new Array(4)}];
	  while (node = nodes.pop()) {
	    for (var i = 0; i < 4; ++i) {
	      if (child = node.source[i]) {
	        if (child.length) nodes.push({source: child, target: node.target[i] = new Array(4)});
	        else node.target[i] = leaf_copy(child);
	      }
	    }
	  }

	  return copy;
	};

	treeProto.add = tree_add;
	treeProto.addAll = addAll;
	treeProto.cover = tree_cover;
	treeProto.data = tree_data;
	treeProto.extent = tree_extent;
	treeProto.find = tree_find;
	treeProto.remove = tree_remove;
	treeProto.removeAll = removeAll;
	treeProto.root = tree_root;
	treeProto.size = tree_size;
	treeProto.visit = tree_visit;
	treeProto.visitAfter = tree_visitAfter;
	treeProto.x = tree_x;
	treeProto.y = tree_y;

	function x(d) {
	  return d.x + d.vx;
	}

	function y(d) {
	  return d.y + d.vy;
	}

	var collide = function(radius) {
	  var nodes,
	      radii,
	      strength = 1,
	      iterations = 1;

	  if (typeof radius !== "function") radius = constant$6(radius == null ? 1 : +radius);

	  function force() {
	    var i, n = nodes.length,
	        tree,
	        node,
	        xi,
	        yi,
	        ri,
	        ri2;

	    for (var k = 0; k < iterations; ++k) {
	      tree = quadtree(nodes, x, y).visitAfter(prepare);
	      for (i = 0; i < n; ++i) {
	        node = nodes[i];
	        ri = radii[node.index], ri2 = ri * ri;
	        xi = node.x + node.vx;
	        yi = node.y + node.vy;
	        tree.visit(apply);
	      }
	    }

	    function apply(quad, x0, y0, x1, y1) {
	      var data = quad.data, rj = quad.r, r = ri + rj;
	      if (data) {
	        if (data.index > node.index) {
	          var x = xi - data.x - data.vx,
	              y = yi - data.y - data.vy,
	              l = x * x + y * y;
	          if (l < r * r) {
	            if (x === 0) x = jiggle(), l += x * x;
	            if (y === 0) y = jiggle(), l += y * y;
	            l = (r - (l = Math.sqrt(l))) / l * strength;
	            node.vx += (x *= l) * (r = (rj *= rj) / (ri2 + rj));
	            node.vy += (y *= l) * r;
	            data.vx -= x * (r = 1 - r);
	            data.vy -= y * r;
	          }
	        }
	        return;
	      }
	      return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r;
	    }
	  }

	  function prepare(quad) {
	    if (quad.data) return quad.r = radii[quad.data.index];
	    for (var i = quad.r = 0; i < 4; ++i) {
	      if (quad[i] && quad[i].r > quad.r) {
	        quad.r = quad[i].r;
	      }
	    }
	  }

	  function initialize() {
	    if (!nodes) return;
	    var i, n = nodes.length, node;
	    radii = new Array(n);
	    for (i = 0; i < n; ++i) node = nodes[i], radii[node.index] = +radius(node, i, nodes);
	  }

	  force.initialize = function(_) {
	    nodes = _;
	    initialize();
	  };

	  force.iterations = function(_) {
	    return arguments.length ? (iterations = +_, force) : iterations;
	  };

	  force.strength = function(_) {
	    return arguments.length ? (strength = +_, force) : strength;
	  };

	  force.radius = function(_) {
	    return arguments.length ? (radius = typeof _ === "function" ? _ : constant$6(+_), initialize(), force) : radius;
	  };

	  return force;
	};

	function index(d) {
	  return d.index;
	}

	function find(nodeById, nodeId) {
	  var node = nodeById.get(nodeId);
	  if (!node) throw new Error("missing: " + nodeId);
	  return node;
	}

	var link = function(links) {
	  var id = index,
	      strength = defaultStrength,
	      strengths,
	      distance = constant$6(30),
	      distances,
	      nodes,
	      count,
	      bias,
	      iterations = 1;

	  if (links == null) links = [];

	  function defaultStrength(link) {
	    return 1 / Math.min(count[link.source.index], count[link.target.index]);
	  }

	  function force(alpha) {
	    for (var k = 0, n = links.length; k < iterations; ++k) {
	      for (var i = 0, link, source, target, x, y, l, b; i < n; ++i) {
	        link = links[i], source = link.source, target = link.target;
	        x = target.x + target.vx - source.x - source.vx || jiggle();
	        y = target.y + target.vy - source.y - source.vy || jiggle();
	        l = Math.sqrt(x * x + y * y);
	        l = (l - distances[i]) / l * alpha * strengths[i];
	        x *= l, y *= l;
	        target.vx -= x * (b = bias[i]);
	        target.vy -= y * b;
	        source.vx += x * (b = 1 - b);
	        source.vy += y * b;
	      }
	    }
	  }

	  function initialize() {
	    if (!nodes) return;

	    var i,
	        n = nodes.length,
	        m = links.length,
	        nodeById = map$1(nodes, id),
	        link;

	    for (i = 0, count = new Array(n); i < m; ++i) {
	      link = links[i], link.index = i;
	      if (typeof link.source !== "object") link.source = find(nodeById, link.source);
	      if (typeof link.target !== "object") link.target = find(nodeById, link.target);
	      count[link.source.index] = (count[link.source.index] || 0) + 1;
	      count[link.target.index] = (count[link.target.index] || 0) + 1;
	    }

	    for (i = 0, bias = new Array(m); i < m; ++i) {
	      link = links[i], bias[i] = count[link.source.index] / (count[link.source.index] + count[link.target.index]);
	    }

	    strengths = new Array(m), initializeStrength();
	    distances = new Array(m), initializeDistance();
	  }

	  function initializeStrength() {
	    if (!nodes) return;

	    for (var i = 0, n = links.length; i < n; ++i) {
	      strengths[i] = +strength(links[i], i, links);
	    }
	  }

	  function initializeDistance() {
	    if (!nodes) return;

	    for (var i = 0, n = links.length; i < n; ++i) {
	      distances[i] = +distance(links[i], i, links);
	    }
	  }

	  force.initialize = function(_) {
	    nodes = _;
	    initialize();
	  };

	  force.links = function(_) {
	    return arguments.length ? (links = _, initialize(), force) : links;
	  };

	  force.id = function(_) {
	    return arguments.length ? (id = _, force) : id;
	  };

	  force.iterations = function(_) {
	    return arguments.length ? (iterations = +_, force) : iterations;
	  };

	  force.strength = function(_) {
	    return arguments.length ? (strength = typeof _ === "function" ? _ : constant$6(+_), initializeStrength(), force) : strength;
	  };

	  force.distance = function(_) {
	    return arguments.length ? (distance = typeof _ === "function" ? _ : constant$6(+_), initializeDistance(), force) : distance;
	  };

	  return force;
	};

	function x$1(d) {
	  return d.x;
	}

	function y$1(d) {
	  return d.y;
	}

	var initialRadius = 10;
	var initialAngle = Math.PI * (3 - Math.sqrt(5));

	var simulation = function(nodes) {
	  var simulation,
	      alpha = 1,
	      alphaMin = 0.001,
	      alphaDecay = 1 - Math.pow(alphaMin, 1 / 300),
	      alphaTarget = 0,
	      velocityDecay = 0.6,
	      forces = map$1(),
	      stepper = timer(step),
	      event = dispatch("tick", "end");

	  if (nodes == null) nodes = [];

	  function step() {
	    tick();
	    event.call("tick", simulation);
	    if (alpha < alphaMin) {
	      stepper.stop();
	      event.call("end", simulation);
	    }
	  }

	  function tick() {
	    var i, n = nodes.length, node;

	    alpha += (alphaTarget - alpha) * alphaDecay;

	    forces.each(function(force) {
	      force(alpha);
	    });

	    for (i = 0; i < n; ++i) {
	      node = nodes[i];
	      if (node.fx == null) node.x += node.vx *= velocityDecay;
	      else node.x = node.fx, node.vx = 0;
	      if (node.fy == null) node.y += node.vy *= velocityDecay;
	      else node.y = node.fy, node.vy = 0;
	    }
	  }

	  function initializeNodes() {
	    for (var i = 0, n = nodes.length, node; i < n; ++i) {
	      node = nodes[i], node.index = i;
	      if (isNaN(node.x) || isNaN(node.y)) {
	        var radius = initialRadius * Math.sqrt(i), angle = i * initialAngle;
	        node.x = radius * Math.cos(angle);
	        node.y = radius * Math.sin(angle);
	      }
	      if (isNaN(node.vx) || isNaN(node.vy)) {
	        node.vx = node.vy = 0;
	      }
	    }
	  }

	  function initializeForce(force) {
	    if (force.initialize) force.initialize(nodes);
	    return force;
	  }

	  initializeNodes();

	  return simulation = {
	    tick: tick,

	    restart: function() {
	      return stepper.restart(step), simulation;
	    },

	    stop: function() {
	      return stepper.stop(), simulation;
	    },

	    nodes: function(_) {
	      return arguments.length ? (nodes = _, initializeNodes(), forces.each(initializeForce), simulation) : nodes;
	    },

	    alpha: function(_) {
	      return arguments.length ? (alpha = +_, simulation) : alpha;
	    },

	    alphaMin: function(_) {
	      return arguments.length ? (alphaMin = +_, simulation) : alphaMin;
	    },

	    alphaDecay: function(_) {
	      return arguments.length ? (alphaDecay = +_, simulation) : +alphaDecay;
	    },

	    alphaTarget: function(_) {
	      return arguments.length ? (alphaTarget = +_, simulation) : alphaTarget;
	    },

	    velocityDecay: function(_) {
	      return arguments.length ? (velocityDecay = 1 - _, simulation) : 1 - velocityDecay;
	    },

	    force: function(name, _) {
	      return arguments.length > 1 ? ((_ == null ? forces.remove(name) : forces.set(name, initializeForce(_))), simulation) : forces.get(name);
	    },

	    find: function(x, y, radius) {
	      var i = 0,
	          n = nodes.length,
	          dx,
	          dy,
	          d2,
	          node,
	          closest;

	      if (radius == null) radius = Infinity;
	      else radius *= radius;

	      for (i = 0; i < n; ++i) {
	        node = nodes[i];
	        dx = x - node.x;
	        dy = y - node.y;
	        d2 = dx * dx + dy * dy;
	        if (d2 < radius) closest = node, radius = d2;
	      }

	      return closest;
	    },

	    on: function(name, _) {
	      return arguments.length > 1 ? (event.on(name, _), simulation) : event.on(name);
	    }
	  };
	};

	var manyBody = function() {
	  var nodes,
	      node,
	      alpha,
	      strength = constant$6(-30),
	      strengths,
	      distanceMin2 = 1,
	      distanceMax2 = Infinity,
	      theta2 = 0.81;

	  function force(_) {
	    var i, n = nodes.length, tree = quadtree(nodes, x$1, y$1).visitAfter(accumulate);
	    for (alpha = _, i = 0; i < n; ++i) node = nodes[i], tree.visit(apply);
	  }

	  function initialize() {
	    if (!nodes) return;
	    var i, n = nodes.length, node;
	    strengths = new Array(n);
	    for (i = 0; i < n; ++i) node = nodes[i], strengths[node.index] = +strength(node, i, nodes);
	  }

	  function accumulate(quad) {
	    var strength = 0, q, c, x$$1, y$$1, i;

	    // For internal nodes, accumulate forces from child quadrants.
	    if (quad.length) {
	      for (x$$1 = y$$1 = i = 0; i < 4; ++i) {
	        if ((q = quad[i]) && (c = q.value)) {
	          strength += c, x$$1 += c * q.x, y$$1 += c * q.y;
	        }
	      }
	      quad.x = x$$1 / strength;
	      quad.y = y$$1 / strength;
	    }

	    // For leaf nodes, accumulate forces from coincident quadrants.
	    else {
	      q = quad;
	      q.x = q.data.x;
	      q.y = q.data.y;
	      do strength += strengths[q.data.index];
	      while (q = q.next);
	    }

	    quad.value = strength;
	  }

	  function apply(quad, x1, _, x2) {
	    if (!quad.value) return true;

	    var x$$1 = quad.x - node.x,
	        y$$1 = quad.y - node.y,
	        w = x2 - x1,
	        l = x$$1 * x$$1 + y$$1 * y$$1;

	    // Apply the Barnes-Hut approximation if possible.
	    // Limit forces for very close nodes; randomize direction if coincident.
	    if (w * w / theta2 < l) {
	      if (l < distanceMax2) {
	        if (x$$1 === 0) x$$1 = jiggle(), l += x$$1 * x$$1;
	        if (y$$1 === 0) y$$1 = jiggle(), l += y$$1 * y$$1;
	        if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
	        node.vx += x$$1 * quad.value * alpha / l;
	        node.vy += y$$1 * quad.value * alpha / l;
	      }
	      return true;
	    }

	    // Otherwise, process points directly.
	    else if (quad.length || l >= distanceMax2) return;

	    // Limit forces for very close nodes; randomize direction if coincident.
	    if (quad.data !== node || quad.next) {
	      if (x$$1 === 0) x$$1 = jiggle(), l += x$$1 * x$$1;
	      if (y$$1 === 0) y$$1 = jiggle(), l += y$$1 * y$$1;
	      if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
	    }

	    do if (quad.data !== node) {
	      w = strengths[quad.data.index] * alpha / l;
	      node.vx += x$$1 * w;
	      node.vy += y$$1 * w;
	    } while (quad = quad.next);
	  }

	  force.initialize = function(_) {
	    nodes = _;
	    initialize();
	  };

	  force.strength = function(_) {
	    return arguments.length ? (strength = typeof _ === "function" ? _ : constant$6(+_), initialize(), force) : strength;
	  };

	  force.distanceMin = function(_) {
	    return arguments.length ? (distanceMin2 = _ * _, force) : Math.sqrt(distanceMin2);
	  };

	  force.distanceMax = function(_) {
	    return arguments.length ? (distanceMax2 = _ * _, force) : Math.sqrt(distanceMax2);
	  };

	  force.theta = function(_) {
	    return arguments.length ? (theta2 = _ * _, force) : Math.sqrt(theta2);
	  };

	  return force;
	};

	var x$2 = function(x) {
	  var strength = constant$6(0.1),
	      nodes,
	      strengths,
	      xz;

	  if (typeof x !== "function") x = constant$6(x == null ? 0 : +x);

	  function force(alpha) {
	    for (var i = 0, n = nodes.length, node; i < n; ++i) {
	      node = nodes[i], node.vx += (xz[i] - node.x) * strengths[i] * alpha;
	    }
	  }

	  function initialize() {
	    if (!nodes) return;
	    var i, n = nodes.length;
	    strengths = new Array(n);
	    xz = new Array(n);
	    for (i = 0; i < n; ++i) {
	      strengths[i] = isNaN(xz[i] = +x(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
	    }
	  }

	  force.initialize = function(_) {
	    nodes = _;
	    initialize();
	  };

	  force.strength = function(_) {
	    return arguments.length ? (strength = typeof _ === "function" ? _ : constant$6(+_), initialize(), force) : strength;
	  };

	  force.x = function(_) {
	    return arguments.length ? (x = typeof _ === "function" ? _ : constant$6(+_), initialize(), force) : x;
	  };

	  return force;
	};

	var y$2 = function(y) {
	  var strength = constant$6(0.1),
	      nodes,
	      strengths,
	      yz;

	  if (typeof y !== "function") y = constant$6(y == null ? 0 : +y);

	  function force(alpha) {
	    for (var i = 0, n = nodes.length, node; i < n; ++i) {
	      node = nodes[i], node.vy += (yz[i] - node.y) * strengths[i] * alpha;
	    }
	  }

	  function initialize() {
	    if (!nodes) return;
	    var i, n = nodes.length;
	    strengths = new Array(n);
	    yz = new Array(n);
	    for (i = 0; i < n; ++i) {
	      strengths[i] = isNaN(yz[i] = +y(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
	    }
	  }

	  force.initialize = function(_) {
	    nodes = _;
	    initialize();
	  };

	  force.strength = function(_) {
	    return arguments.length ? (strength = typeof _ === "function" ? _ : constant$6(+_), initialize(), force) : strength;
	  };

	  force.y = function(_) {
	    return arguments.length ? (y = typeof _ === "function" ? _ : constant$6(+_), initialize(), force) : y;
	  };

	  return force;
	};

	// Computes the decimal coefficient and exponent of the specified number x with
	// significant digits p, where x is positive and p is in [1, 21] or undefined.
	// For example, formatDecimal(1.23) returns ["123", 0].
	var formatDecimal = function(x, p) {
	  if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
	  var i, coefficient = x.slice(0, i);

	  // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
	  // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
	  return [
	    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
	    +x.slice(i + 1)
	  ];
	};

	var exponent$1 = function(x) {
	  return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
	};

	var formatGroup = function(grouping, thousands) {
	  return function(value, width) {
	    var i = value.length,
	        t = [],
	        j = 0,
	        g = grouping[0],
	        length = 0;

	    while (i > 0 && g > 0) {
	      if (length + g + 1 > width) g = Math.max(1, width - length);
	      t.push(value.substring(i -= g, i + g));
	      if ((length += g + 1) > width) break;
	      g = grouping[j = (j + 1) % grouping.length];
	    }

	    return t.reverse().join(thousands);
	  };
	};

	var formatNumerals = function(numerals) {
	  return function(value) {
	    return value.replace(/[0-9]/g, function(i) {
	      return numerals[+i];
	    });
	  };
	};

	var formatDefault = function(x, p) {
	  x = x.toPrecision(p);

	  out: for (var n = x.length, i = 1, i0 = -1, i1; i < n; ++i) {
	    switch (x[i]) {
	      case ".": i0 = i1 = i; break;
	      case "0": if (i0 === 0) i0 = i; i1 = i; break;
	      case "e": break out;
	      default: if (i0 > 0) i0 = 0; break;
	    }
	  }

	  return i0 > 0 ? x.slice(0, i0) + x.slice(i1 + 1) : x;
	};

	var prefixExponent;

	var formatPrefixAuto = function(x, p) {
	  var d = formatDecimal(x, p);
	  if (!d) return x + "";
	  var coefficient = d[0],
	      exponent = d[1],
	      i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
	      n = coefficient.length;
	  return i === n ? coefficient
	      : i > n ? coefficient + new Array(i - n + 1).join("0")
	      : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
	      : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
	};

	var formatRounded = function(x, p) {
	  var d = formatDecimal(x, p);
	  if (!d) return x + "";
	  var coefficient = d[0],
	      exponent = d[1];
	  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
	      : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
	      : coefficient + new Array(exponent - coefficient.length + 2).join("0");
	};

	var formatTypes = {
	  "": formatDefault,
	  "%": function(x, p) { return (x * 100).toFixed(p); },
	  "b": function(x) { return Math.round(x).toString(2); },
	  "c": function(x) { return x + ""; },
	  "d": function(x) { return Math.round(x).toString(10); },
	  "e": function(x, p) { return x.toExponential(p); },
	  "f": function(x, p) { return x.toFixed(p); },
	  "g": function(x, p) { return x.toPrecision(p); },
	  "o": function(x) { return Math.round(x).toString(8); },
	  "p": function(x, p) { return formatRounded(x * 100, p); },
	  "r": formatRounded,
	  "s": formatPrefixAuto,
	  "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
	  "x": function(x) { return Math.round(x).toString(16); }
	};

	// [[fill]align][sign][symbol][0][width][,][.precision][type]
	var re = /^(?:(.)?([<>=^]))?([+\-\( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?([a-z%])?$/i;

	function formatSpecifier(specifier) {
	  return new FormatSpecifier(specifier);
	}

	formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

	function FormatSpecifier(specifier) {
	  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);

	  var match,
	      fill = match[1] || " ",
	      align = match[2] || ">",
	      sign = match[3] || "-",
	      symbol = match[4] || "",
	      zero = !!match[5],
	      width = match[6] && +match[6],
	      comma = !!match[7],
	      precision = match[8] && +match[8].slice(1),
	      type = match[9] || "";

	  // The "n" type is an alias for ",g".
	  if (type === "n") comma = true, type = "g";

	  // Map invalid types to the default format.
	  else if (!formatTypes[type]) type = "";

	  // If zero fill is specified, padding goes after sign and before digits.
	  if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

	  this.fill = fill;
	  this.align = align;
	  this.sign = sign;
	  this.symbol = symbol;
	  this.zero = zero;
	  this.width = width;
	  this.comma = comma;
	  this.precision = precision;
	  this.type = type;
	}

	FormatSpecifier.prototype.toString = function() {
	  return this.fill
	      + this.align
	      + this.sign
	      + this.symbol
	      + (this.zero ? "0" : "")
	      + (this.width == null ? "" : Math.max(1, this.width | 0))
	      + (this.comma ? "," : "")
	      + (this.precision == null ? "" : "." + Math.max(0, this.precision | 0))
	      + this.type;
	};

	var identity$3 = function(x) {
	  return x;
	};

	var prefixes = ["y","z","a","f","p","n","\xB5","m","","k","M","G","T","P","E","Z","Y"];

	var formatLocale = function(locale) {
	  var group = locale.grouping && locale.thousands ? formatGroup(locale.grouping, locale.thousands) : identity$3,
	      currency = locale.currency,
	      decimal = locale.decimal,
	      numerals = locale.numerals ? formatNumerals(locale.numerals) : identity$3,
	      percent = locale.percent || "%";

	  function newFormat(specifier) {
	    specifier = formatSpecifier(specifier);

	    var fill = specifier.fill,
	        align = specifier.align,
	        sign = specifier.sign,
	        symbol = specifier.symbol,
	        zero = specifier.zero,
	        width = specifier.width,
	        comma = specifier.comma,
	        precision = specifier.precision,
	        type = specifier.type;

	    // Compute the prefix and suffix.
	    // For SI-prefix, the suffix is lazily computed.
	    var prefix = symbol === "$" ? currency[0] : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
	        suffix = symbol === "$" ? currency[1] : /[%p]/.test(type) ? percent : "";

	    // What format function should we use?
	    // Is this an integer type?
	    // Can this type generate exponential notation?
	    var formatType = formatTypes[type],
	        maybeSuffix = !type || /[defgprs%]/.test(type);

	    // Set the default precision if not specified,
	    // or clamp the specified precision to the supported range.
	    // For significant precision, it must be in [1, 21].
	    // For fixed precision, it must be in [0, 20].
	    precision = precision == null ? (type ? 6 : 12)
	        : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
	        : Math.max(0, Math.min(20, precision));

	    function format(value) {
	      var valuePrefix = prefix,
	          valueSuffix = suffix,
	          i, n, c;

	      if (type === "c") {
	        valueSuffix = formatType(value) + valueSuffix;
	        value = "";
	      } else {
	        value = +value;

	        // Perform the initial formatting.
	        var valueNegative = value < 0;
	        value = formatType(Math.abs(value), precision);

	        // If a negative value rounds to zero during formatting, treat as positive.
	        if (valueNegative && +value === 0) valueNegative = false;

	        // Compute the prefix and suffix.
	        valuePrefix = (valueNegative ? (sign === "(" ? sign : "-") : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
	        valueSuffix = valueSuffix + (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + (valueNegative && sign === "(" ? ")" : "");

	        // Break the formatted value into the integer “value” part that can be
	        // grouped, and fractional or exponential “suffix” part that is not.
	        if (maybeSuffix) {
	          i = -1, n = value.length;
	          while (++i < n) {
	            if (c = value.charCodeAt(i), 48 > c || c > 57) {
	              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
	              value = value.slice(0, i);
	              break;
	            }
	          }
	        }
	      }

	      // If the fill character is not "0", grouping is applied before padding.
	      if (comma && !zero) value = group(value, Infinity);

	      // Compute the padding.
	      var length = valuePrefix.length + value.length + valueSuffix.length,
	          padding = length < width ? new Array(width - length + 1).join(fill) : "";

	      // If the fill character is "0", grouping is applied after padding.
	      if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

	      // Reconstruct the final output based on the desired alignment.
	      switch (align) {
	        case "<": value = valuePrefix + value + valueSuffix + padding; break;
	        case "=": value = valuePrefix + padding + value + valueSuffix; break;
	        case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
	        default: value = padding + valuePrefix + value + valueSuffix; break;
	      }

	      return numerals(value);
	    }

	    format.toString = function() {
	      return specifier + "";
	    };

	    return format;
	  }

	  function formatPrefix(specifier, value) {
	    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
	        e = Math.max(-8, Math.min(8, Math.floor(exponent$1(value) / 3))) * 3,
	        k = Math.pow(10, -e),
	        prefix = prefixes[8 + e / 3];
	    return function(value) {
	      return f(k * value) + prefix;
	    };
	  }

	  return {
	    format: newFormat,
	    formatPrefix: formatPrefix
	  };
	};

	var locale$1;



	defaultLocale({
	  decimal: ".",
	  thousands: ",",
	  grouping: [3],
	  currency: ["$", ""]
	});

	function defaultLocale(definition) {
	  locale$1 = formatLocale(definition);
	  exports.format = locale$1.format;
	  exports.formatPrefix = locale$1.formatPrefix;
	  return locale$1;
	}

	var precisionFixed = function(step) {
	  return Math.max(0, -exponent$1(Math.abs(step)));
	};

	var precisionPrefix = function(step, value) {
	  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent$1(value) / 3))) * 3 - exponent$1(Math.abs(step)));
	};

	var precisionRound = function(step, max) {
	  step = Math.abs(step), max = Math.abs(max) - step;
	  return Math.max(0, exponent$1(max) - exponent$1(step)) + 1;
	};

	// Adds floating point numbers with twice the normal precision.
	// Reference: J. R. Shewchuk, Adaptive Precision Floating-Point Arithmetic and
	// Fast Robust Geometric Predicates, Discrete & Computational Geometry 18(3)
	// 305–363 (1997).
	// Code adapted from GeographicLib by Charles F. F. Karney,
	// http://geographiclib.sourceforge.net/

	var adder = function() {
	  return new Adder;
	};

	function Adder() {
	  this.reset();
	}

	Adder.prototype = {
	  constructor: Adder,
	  reset: function() {
	    this.s = // rounded value
	    this.t = 0; // exact error
	  },
	  add: function(y) {
	    add$1(temp, y, this.t);
	    add$1(this, temp.s, this.s);
	    if (this.s) this.t += temp.t;
	    else this.s = temp.t;
	  },
	  valueOf: function() {
	    return this.s;
	  }
	};

	var temp = new Adder;

	function add$1(adder, a, b) {
	  var x = adder.s = a + b,
	      bv = x - a,
	      av = x - bv;
	  adder.t = (a - av) + (b - bv);
	}

	var epsilon$2 = 1e-6;
	var epsilon2$1 = 1e-12;
	var pi$3 = Math.PI;
	var halfPi$2 = pi$3 / 2;
	var quarterPi = pi$3 / 4;
	var tau$3 = pi$3 * 2;

	var degrees$1 = 180 / pi$3;
	var radians = pi$3 / 180;

	var abs = Math.abs;
	var atan = Math.atan;
	var atan2 = Math.atan2;
	var cos$1 = Math.cos;
	var ceil = Math.ceil;
	var exp = Math.exp;

	var log = Math.log;
	var pow = Math.pow;
	var sin$1 = Math.sin;
	var sign = Math.sign || function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
	var sqrt = Math.sqrt;
	var tan = Math.tan;

	function acos(x) {
	  return x > 1 ? 0 : x < -1 ? pi$3 : Math.acos(x);
	}

	function asin(x) {
	  return x > 1 ? halfPi$2 : x < -1 ? -halfPi$2 : Math.asin(x);
	}

	function haversin(x) {
	  return (x = sin$1(x / 2)) * x;
	}

	function noop$1() {}

	function streamGeometry(geometry, stream) {
	  if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
	    streamGeometryType[geometry.type](geometry, stream);
	  }
	}

	var streamObjectType = {
	  Feature: function(object, stream) {
	    streamGeometry(object.geometry, stream);
	  },
	  FeatureCollection: function(object, stream) {
	    var features = object.features, i = -1, n = features.length;
	    while (++i < n) streamGeometry(features[i].geometry, stream);
	  }
	};

	var streamGeometryType = {
	  Sphere: function(object, stream) {
	    stream.sphere();
	  },
	  Point: function(object, stream) {
	    object = object.coordinates;
	    stream.point(object[0], object[1], object[2]);
	  },
	  MultiPoint: function(object, stream) {
	    var coordinates = object.coordinates, i = -1, n = coordinates.length;
	    while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
	  },
	  LineString: function(object, stream) {
	    streamLine(object.coordinates, stream, 0);
	  },
	  MultiLineString: function(object, stream) {
	    var coordinates = object.coordinates, i = -1, n = coordinates.length;
	    while (++i < n) streamLine(coordinates[i], stream, 0);
	  },
	  Polygon: function(object, stream) {
	    streamPolygon(object.coordinates, stream);
	  },
	  MultiPolygon: function(object, stream) {
	    var coordinates = object.coordinates, i = -1, n = coordinates.length;
	    while (++i < n) streamPolygon(coordinates[i], stream);
	  },
	  GeometryCollection: function(object, stream) {
	    var geometries = object.geometries, i = -1, n = geometries.length;
	    while (++i < n) streamGeometry(geometries[i], stream);
	  }
	};

	function streamLine(coordinates, stream, closed) {
	  var i = -1, n = coordinates.length - closed, coordinate;
	  stream.lineStart();
	  while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
	  stream.lineEnd();
	}

	function streamPolygon(coordinates, stream) {
	  var i = -1, n = coordinates.length;
	  stream.polygonStart();
	  while (++i < n) streamLine(coordinates[i], stream, 1);
	  stream.polygonEnd();
	}

	var geoStream = function(object, stream) {
	  if (object && streamObjectType.hasOwnProperty(object.type)) {
	    streamObjectType[object.type](object, stream);
	  } else {
	    streamGeometry(object, stream);
	  }
	};

	var areaRingSum = adder();

	var areaSum = adder();
	var lambda00;
	var phi00;
	var lambda0;
	var cosPhi0;
	var sinPhi0;

	var areaStream = {
	  point: noop$1,
	  lineStart: noop$1,
	  lineEnd: noop$1,
	  polygonStart: function() {
	    areaRingSum.reset();
	    areaStream.lineStart = areaRingStart;
	    areaStream.lineEnd = areaRingEnd;
	  },
	  polygonEnd: function() {
	    var areaRing = +areaRingSum;
	    areaSum.add(areaRing < 0 ? tau$3 + areaRing : areaRing);
	    this.lineStart = this.lineEnd = this.point = noop$1;
	  },
	  sphere: function() {
	    areaSum.add(tau$3);
	  }
	};

	function areaRingStart() {
	  areaStream.point = areaPointFirst;
	}

	function areaRingEnd() {
	  areaPoint(lambda00, phi00);
	}

	function areaPointFirst(lambda, phi) {
	  areaStream.point = areaPoint;
	  lambda00 = lambda, phi00 = phi;
	  lambda *= radians, phi *= radians;
	  lambda0 = lambda, cosPhi0 = cos$1(phi = phi / 2 + quarterPi), sinPhi0 = sin$1(phi);
	}

	function areaPoint(lambda, phi) {
	  lambda *= radians, phi *= radians;
	  phi = phi / 2 + quarterPi; // half the angular distance from south pole

	  // Spherical excess E for a spherical triangle with vertices: south pole,
	  // previous point, current point.  Uses a formula derived from Cagnoli’s
	  // theorem.  See Todhunter, Spherical Trig. (1871), Sec. 103, Eq. (2).
	  var dLambda = lambda - lambda0,
	      sdLambda = dLambda >= 0 ? 1 : -1,
	      adLambda = sdLambda * dLambda,
	      cosPhi = cos$1(phi),
	      sinPhi = sin$1(phi),
	      k = sinPhi0 * sinPhi,
	      u = cosPhi0 * cosPhi + k * cos$1(adLambda),
	      v = k * sdLambda * sin$1(adLambda);
	  areaRingSum.add(atan2(v, u));

	  // Advance the previous points.
	  lambda0 = lambda, cosPhi0 = cosPhi, sinPhi0 = sinPhi;
	}

	var area = function(object) {
	  areaSum.reset();
	  geoStream(object, areaStream);
	  return areaSum * 2;
	};

	function spherical(cartesian) {
	  return [atan2(cartesian[1], cartesian[0]), asin(cartesian[2])];
	}

	function cartesian(spherical) {
	  var lambda = spherical[0], phi = spherical[1], cosPhi = cos$1(phi);
	  return [cosPhi * cos$1(lambda), cosPhi * sin$1(lambda), sin$1(phi)];
	}

	function cartesianDot(a, b) {
	  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	}

	function cartesianCross(a, b) {
	  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
	}

	// TODO return a
	function cartesianAddInPlace(a, b) {
	  a[0] += b[0], a[1] += b[1], a[2] += b[2];
	}

	function cartesianScale(vector, k) {
	  return [vector[0] * k, vector[1] * k, vector[2] * k];
	}

	// TODO return d
	function cartesianNormalizeInPlace(d) {
	  var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
	  d[0] /= l, d[1] /= l, d[2] /= l;
	}

	var lambda0$1;
	var phi0;
	var lambda1;
	var phi1;
	var lambda2;
	var lambda00$1;
	var phi00$1;
	var p0;
	var deltaSum = adder();
	var ranges;
	var range;

	var boundsStream = {
	  point: boundsPoint,
	  lineStart: boundsLineStart,
	  lineEnd: boundsLineEnd,
	  polygonStart: function() {
	    boundsStream.point = boundsRingPoint;
	    boundsStream.lineStart = boundsRingStart;
	    boundsStream.lineEnd = boundsRingEnd;
	    deltaSum.reset();
	    areaStream.polygonStart();
	  },
	  polygonEnd: function() {
	    areaStream.polygonEnd();
	    boundsStream.point = boundsPoint;
	    boundsStream.lineStart = boundsLineStart;
	    boundsStream.lineEnd = boundsLineEnd;
	    if (areaRingSum < 0) lambda0$1 = -(lambda1 = 180), phi0 = -(phi1 = 90);
	    else if (deltaSum > epsilon$2) phi1 = 90;
	    else if (deltaSum < -epsilon$2) phi0 = -90;
	    range[0] = lambda0$1, range[1] = lambda1;
	  }
	};

	function boundsPoint(lambda, phi) {
	  ranges.push(range = [lambda0$1 = lambda, lambda1 = lambda]);
	  if (phi < phi0) phi0 = phi;
	  if (phi > phi1) phi1 = phi;
	}

	function linePoint(lambda, phi) {
	  var p = cartesian([lambda * radians, phi * radians]);
	  if (p0) {
	    var normal = cartesianCross(p0, p),
	        equatorial = [normal[1], -normal[0], 0],
	        inflection = cartesianCross(equatorial, normal);
	    cartesianNormalizeInPlace(inflection);
	    inflection = spherical(inflection);
	    var delta = lambda - lambda2,
	        sign$$1 = delta > 0 ? 1 : -1,
	        lambdai = inflection[0] * degrees$1 * sign$$1,
	        phii,
	        antimeridian = abs(delta) > 180;
	    if (antimeridian ^ (sign$$1 * lambda2 < lambdai && lambdai < sign$$1 * lambda)) {
	      phii = inflection[1] * degrees$1;
	      if (phii > phi1) phi1 = phii;
	    } else if (lambdai = (lambdai + 360) % 360 - 180, antimeridian ^ (sign$$1 * lambda2 < lambdai && lambdai < sign$$1 * lambda)) {
	      phii = -inflection[1] * degrees$1;
	      if (phii < phi0) phi0 = phii;
	    } else {
	      if (phi < phi0) phi0 = phi;
	      if (phi > phi1) phi1 = phi;
	    }
	    if (antimeridian) {
	      if (lambda < lambda2) {
	        if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1)) lambda1 = lambda;
	      } else {
	        if (angle(lambda, lambda1) > angle(lambda0$1, lambda1)) lambda0$1 = lambda;
	      }
	    } else {
	      if (lambda1 >= lambda0$1) {
	        if (lambda < lambda0$1) lambda0$1 = lambda;
	        if (lambda > lambda1) lambda1 = lambda;
	      } else {
	        if (lambda > lambda2) {
	          if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1)) lambda1 = lambda;
	        } else {
	          if (angle(lambda, lambda1) > angle(lambda0$1, lambda1)) lambda0$1 = lambda;
	        }
	      }
	    }
	  } else {
	    ranges.push(range = [lambda0$1 = lambda, lambda1 = lambda]);
	  }
	  if (phi < phi0) phi0 = phi;
	  if (phi > phi1) phi1 = phi;
	  p0 = p, lambda2 = lambda;
	}

	function boundsLineStart() {
	  boundsStream.point = linePoint;
	}

	function boundsLineEnd() {
	  range[0] = lambda0$1, range[1] = lambda1;
	  boundsStream.point = boundsPoint;
	  p0 = null;
	}

	function boundsRingPoint(lambda, phi) {
	  if (p0) {
	    var delta = lambda - lambda2;
	    deltaSum.add(abs(delta) > 180 ? delta + (delta > 0 ? 360 : -360) : delta);
	  } else {
	    lambda00$1 = lambda, phi00$1 = phi;
	  }
	  areaStream.point(lambda, phi);
	  linePoint(lambda, phi);
	}

	function boundsRingStart() {
	  areaStream.lineStart();
	}

	function boundsRingEnd() {
	  boundsRingPoint(lambda00$1, phi00$1);
	  areaStream.lineEnd();
	  if (abs(deltaSum) > epsilon$2) lambda0$1 = -(lambda1 = 180);
	  range[0] = lambda0$1, range[1] = lambda1;
	  p0 = null;
	}

	// Finds the left-right distance between two longitudes.
	// This is almost the same as (lambda1 - lambda0 + 360°) % 360°, except that we want
	// the distance between ±180° to be 360°.
	function angle(lambda0, lambda1) {
	  return (lambda1 -= lambda0) < 0 ? lambda1 + 360 : lambda1;
	}

	function rangeCompare(a, b) {
	  return a[0] - b[0];
	}

	function rangeContains(range, x) {
	  return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
	}

	var bounds = function(feature) {
	  var i, n, a, b, merged, deltaMax, delta;

	  phi1 = lambda1 = -(lambda0$1 = phi0 = Infinity);
	  ranges = [];
	  geoStream(feature, boundsStream);

	  // First, sort ranges by their minimum longitudes.
	  if (n = ranges.length) {
	    ranges.sort(rangeCompare);

	    // Then, merge any ranges that overlap.
	    for (i = 1, a = ranges[0], merged = [a]; i < n; ++i) {
	      b = ranges[i];
	      if (rangeContains(a, b[0]) || rangeContains(a, b[1])) {
	        if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
	        if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
	      } else {
	        merged.push(a = b);
	      }
	    }

	    // Finally, find the largest gap between the merged ranges.
	    // The final bounding box will be the inverse of this gap.
	    for (deltaMax = -Infinity, n = merged.length - 1, i = 0, a = merged[n]; i <= n; a = b, ++i) {
	      b = merged[i];
	      if ((delta = angle(a[1], b[0])) > deltaMax) deltaMax = delta, lambda0$1 = b[0], lambda1 = a[1];
	    }
	  }

	  ranges = range = null;

	  return lambda0$1 === Infinity || phi0 === Infinity
	      ? [[NaN, NaN], [NaN, NaN]]
	      : [[lambda0$1, phi0], [lambda1, phi1]];
	};

	var W0;
	var W1;
	var X0;
	var Y0;
	var Z0;
	var X1;
	var Y1;
	var Z1;
	var X2;
	var Y2;
	var Z2;
	var lambda00$2;
	var phi00$2;
	var x0;
	var y0;
	var z0; // previous point

	var centroidStream = {
	  sphere: noop$1,
	  point: centroidPoint,
	  lineStart: centroidLineStart,
	  lineEnd: centroidLineEnd,
	  polygonStart: function() {
	    centroidStream.lineStart = centroidRingStart;
	    centroidStream.lineEnd = centroidRingEnd;
	  },
	  polygonEnd: function() {
	    centroidStream.lineStart = centroidLineStart;
	    centroidStream.lineEnd = centroidLineEnd;
	  }
	};

	// Arithmetic mean of Cartesian vectors.
	function centroidPoint(lambda, phi) {
	  lambda *= radians, phi *= radians;
	  var cosPhi = cos$1(phi);
	  centroidPointCartesian(cosPhi * cos$1(lambda), cosPhi * sin$1(lambda), sin$1(phi));
	}

	function centroidPointCartesian(x, y, z) {
	  ++W0;
	  X0 += (x - X0) / W0;
	  Y0 += (y - Y0) / W0;
	  Z0 += (z - Z0) / W0;
	}

	function centroidLineStart() {
	  centroidStream.point = centroidLinePointFirst;
	}

	function centroidLinePointFirst(lambda, phi) {
	  lambda *= radians, phi *= radians;
	  var cosPhi = cos$1(phi);
	  x0 = cosPhi * cos$1(lambda);
	  y0 = cosPhi * sin$1(lambda);
	  z0 = sin$1(phi);
	  centroidStream.point = centroidLinePoint;
	  centroidPointCartesian(x0, y0, z0);
	}

	function centroidLinePoint(lambda, phi) {
	  lambda *= radians, phi *= radians;
	  var cosPhi = cos$1(phi),
	      x = cosPhi * cos$1(lambda),
	      y = cosPhi * sin$1(lambda),
	      z = sin$1(phi),
	      w = atan2(sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
	  W1 += w;
	  X1 += w * (x0 + (x0 = x));
	  Y1 += w * (y0 + (y0 = y));
	  Z1 += w * (z0 + (z0 = z));
	  centroidPointCartesian(x0, y0, z0);
	}

	function centroidLineEnd() {
	  centroidStream.point = centroidPoint;
	}

	// See J. E. Brock, The Inertia Tensor for a Spherical Triangle,
	// J. Applied Mechanics 42, 239 (1975).
	function centroidRingStart() {
	  centroidStream.point = centroidRingPointFirst;
	}

	function centroidRingEnd() {
	  centroidRingPoint(lambda00$2, phi00$2);
	  centroidStream.point = centroidPoint;
	}

	function centroidRingPointFirst(lambda, phi) {
	  lambda00$2 = lambda, phi00$2 = phi;
	  lambda *= radians, phi *= radians;
	  centroidStream.point = centroidRingPoint;
	  var cosPhi = cos$1(phi);
	  x0 = cosPhi * cos$1(lambda);
	  y0 = cosPhi * sin$1(lambda);
	  z0 = sin$1(phi);
	  centroidPointCartesian(x0, y0, z0);
	}

	function centroidRingPoint(lambda, phi) {
	  lambda *= radians, phi *= radians;
	  var cosPhi = cos$1(phi),
	      x = cosPhi * cos$1(lambda),
	      y = cosPhi * sin$1(lambda),
	      z = sin$1(phi),
	      cx = y0 * z - z0 * y,
	      cy = z0 * x - x0 * z,
	      cz = x0 * y - y0 * x,
	      m = sqrt(cx * cx + cy * cy + cz * cz),
	      w = asin(m), // line weight = angle
	      v = m && -w / m; // area weight multiplier
	  X2 += v * cx;
	  Y2 += v * cy;
	  Z2 += v * cz;
	  W1 += w;
	  X1 += w * (x0 + (x0 = x));
	  Y1 += w * (y0 + (y0 = y));
	  Z1 += w * (z0 + (z0 = z));
	  centroidPointCartesian(x0, y0, z0);
	}

	var centroid = function(object) {
	  W0 = W1 =
	  X0 = Y0 = Z0 =
	  X1 = Y1 = Z1 =
	  X2 = Y2 = Z2 = 0;
	  geoStream(object, centroidStream);

	  var x = X2,
	      y = Y2,
	      z = Z2,
	      m = x * x + y * y + z * z;

	  // If the area-weighted ccentroid is undefined, fall back to length-weighted ccentroid.
	  if (m < epsilon2$1) {
	    x = X1, y = Y1, z = Z1;
	    // If the feature has zero length, fall back to arithmetic mean of point vectors.
	    if (W1 < epsilon$2) x = X0, y = Y0, z = Z0;
	    m = x * x + y * y + z * z;
	    // If the feature still has an undefined ccentroid, then return.
	    if (m < epsilon2$1) return [NaN, NaN];
	  }

	  return [atan2(y, x) * degrees$1, asin(z / sqrt(m)) * degrees$1];
	};

	var constant$7 = function(x) {
	  return function() {
	    return x;
	  };
	};

	var compose = function(a, b) {

	  function compose(x, y) {
	    return x = a(x, y), b(x[0], x[1]);
	  }

	  if (a.invert && b.invert) compose.invert = function(x, y) {
	    return x = b.invert(x, y), x && a.invert(x[0], x[1]);
	  };

	  return compose;
	};

	function rotationIdentity(lambda, phi) {
	  return [lambda > pi$3 ? lambda - tau$3 : lambda < -pi$3 ? lambda + tau$3 : lambda, phi];
	}

	rotationIdentity.invert = rotationIdentity;

	function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
	  return (deltaLambda %= tau$3) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma))
	    : rotationLambda(deltaLambda))
	    : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma)
	    : rotationIdentity);
	}

	function forwardRotationLambda(deltaLambda) {
	  return function(lambda, phi) {
	    return lambda += deltaLambda, [lambda > pi$3 ? lambda - tau$3 : lambda < -pi$3 ? lambda + tau$3 : lambda, phi];
	  };
	}

	function rotationLambda(deltaLambda) {
	  var rotation = forwardRotationLambda(deltaLambda);
	  rotation.invert = forwardRotationLambda(-deltaLambda);
	  return rotation;
	}

	function rotationPhiGamma(deltaPhi, deltaGamma) {
	  var cosDeltaPhi = cos$1(deltaPhi),
	      sinDeltaPhi = sin$1(deltaPhi),
	      cosDeltaGamma = cos$1(deltaGamma),
	      sinDeltaGamma = sin$1(deltaGamma);

	  function rotation(lambda, phi) {
	    var cosPhi = cos$1(phi),
	        x = cos$1(lambda) * cosPhi,
	        y = sin$1(lambda) * cosPhi,
	        z = sin$1(phi),
	        k = z * cosDeltaPhi + x * sinDeltaPhi;
	    return [
	      atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
	      asin(k * cosDeltaGamma + y * sinDeltaGamma)
	    ];
	  }

	  rotation.invert = function(lambda, phi) {
	    var cosPhi = cos$1(phi),
	        x = cos$1(lambda) * cosPhi,
	        y = sin$1(lambda) * cosPhi,
	        z = sin$1(phi),
	        k = z * cosDeltaGamma - y * sinDeltaGamma;
	    return [
	      atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
	      asin(k * cosDeltaPhi - x * sinDeltaPhi)
	    ];
	  };

	  return rotation;
	}

	var rotation = function(rotate) {
	  rotate = rotateRadians(rotate[0] * radians, rotate[1] * radians, rotate.length > 2 ? rotate[2] * radians : 0);

	  function forward(coordinates) {
	    coordinates = rotate(coordinates[0] * radians, coordinates[1] * radians);
	    return coordinates[0] *= degrees$1, coordinates[1] *= degrees$1, coordinates;
	  }

	  forward.invert = function(coordinates) {
	    coordinates = rotate.invert(coordinates[0] * radians, coordinates[1] * radians);
	    return coordinates[0] *= degrees$1, coordinates[1] *= degrees$1, coordinates;
	  };

	  return forward;
	};

	// Generates a circle centered at [0°, 0°], with a given radius and precision.
	function circleStream(stream, radius, delta, direction, t0, t1) {
	  if (!delta) return;
	  var cosRadius = cos$1(radius),
	      sinRadius = sin$1(radius),
	      step = direction * delta;
	  if (t0 == null) {
	    t0 = radius + direction * tau$3;
	    t1 = radius - step / 2;
	  } else {
	    t0 = circleRadius(cosRadius, t0);
	    t1 = circleRadius(cosRadius, t1);
	    if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau$3;
	  }
	  for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
	    point = spherical([cosRadius, -sinRadius * cos$1(t), -sinRadius * sin$1(t)]);
	    stream.point(point[0], point[1]);
	  }
	}

	// Returns the signed angle of a cartesian point relative to [cosRadius, 0, 0].
	function circleRadius(cosRadius, point) {
	  point = cartesian(point), point[0] -= cosRadius;
	  cartesianNormalizeInPlace(point);
	  var radius = acos(-point[1]);
	  return ((-point[2] < 0 ? -radius : radius) + tau$3 - epsilon$2) % tau$3;
	}

	var circle = function() {
	  var center = constant$7([0, 0]),
	      radius = constant$7(90),
	      precision = constant$7(6),
	      ring,
	      rotate,
	      stream = {point: point};

	  function point(x, y) {
	    ring.push(x = rotate(x, y));
	    x[0] *= degrees$1, x[1] *= degrees$1;
	  }

	  function circle() {
	    var c = center.apply(this, arguments),
	        r = radius.apply(this, arguments) * radians,
	        p = precision.apply(this, arguments) * radians;
	    ring = [];
	    rotate = rotateRadians(-c[0] * radians, -c[1] * radians, 0).invert;
	    circleStream(stream, r, p, 1);
	    c = {type: "Polygon", coordinates: [ring]};
	    ring = rotate = null;
	    return c;
	  }

	  circle.center = function(_) {
	    return arguments.length ? (center = typeof _ === "function" ? _ : constant$7([+_[0], +_[1]]), circle) : center;
	  };

	  circle.radius = function(_) {
	    return arguments.length ? (radius = typeof _ === "function" ? _ : constant$7(+_), circle) : radius;
	  };

	  circle.precision = function(_) {
	    return arguments.length ? (precision = typeof _ === "function" ? _ : constant$7(+_), circle) : precision;
	  };

	  return circle;
	};

	var clipBuffer = function() {
	  var lines = [],
	      line;
	  return {
	    point: function(x, y) {
	      line.push([x, y]);
	    },
	    lineStart: function() {
	      lines.push(line = []);
	    },
	    lineEnd: noop$1,
	    rejoin: function() {
	      if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
	    },
	    result: function() {
	      var result = lines;
	      lines = [];
	      line = null;
	      return result;
	    }
	  };
	};

	var clipLine = function(a, b, x0, y0, x1, y1) {
	  var ax = a[0],
	      ay = a[1],
	      bx = b[0],
	      by = b[1],
	      t0 = 0,
	      t1 = 1,
	      dx = bx - ax,
	      dy = by - ay,
	      r;

	  r = x0 - ax;
	  if (!dx && r > 0) return;
	  r /= dx;
	  if (dx < 0) {
	    if (r < t0) return;
	    if (r < t1) t1 = r;
	  } else if (dx > 0) {
	    if (r > t1) return;
	    if (r > t0) t0 = r;
	  }

	  r = x1 - ax;
	  if (!dx && r < 0) return;
	  r /= dx;
	  if (dx < 0) {
	    if (r > t1) return;
	    if (r > t0) t0 = r;
	  } else if (dx > 0) {
	    if (r < t0) return;
	    if (r < t1) t1 = r;
	  }

	  r = y0 - ay;
	  if (!dy && r > 0) return;
	  r /= dy;
	  if (dy < 0) {
	    if (r < t0) return;
	    if (r < t1) t1 = r;
	  } else if (dy > 0) {
	    if (r > t1) return;
	    if (r > t0) t0 = r;
	  }

	  r = y1 - ay;
	  if (!dy && r < 0) return;
	  r /= dy;
	  if (dy < 0) {
	    if (r > t1) return;
	    if (r > t0) t0 = r;
	  } else if (dy > 0) {
	    if (r < t0) return;
	    if (r < t1) t1 = r;
	  }

	  if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
	  if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
	  return true;
	};

	var pointEqual = function(a, b) {
	  return abs(a[0] - b[0]) < epsilon$2 && abs(a[1] - b[1]) < epsilon$2;
	};

	function Intersection(point, points, other, entry) {
	  this.x = point;
	  this.z = points;
	  this.o = other; // another intersection
	  this.e = entry; // is an entry?
	  this.v = false; // visited
	  this.n = this.p = null; // next & previous
	}

	// A generalized polygon clipping algorithm: given a polygon that has been cut
	// into its visible line segments, and rejoins the segments by interpolating
	// along the clip edge.
	var clipPolygon = function(segments, compareIntersection, startInside, interpolate, stream) {
	  var subject = [],
	      clip = [],
	      i,
	      n;

	  segments.forEach(function(segment) {
	    if ((n = segment.length - 1) <= 0) return;
	    var n, p0 = segment[0], p1 = segment[n], x;

	    // If the first and last points of a segment are coincident, then treat as a
	    // closed ring. TODO if all rings are closed, then the winding order of the
	    // exterior ring should be checked.
	    if (pointEqual(p0, p1)) {
	      stream.lineStart();
	      for (i = 0; i < n; ++i) stream.point((p0 = segment[i])[0], p0[1]);
	      stream.lineEnd();
	      return;
	    }

	    subject.push(x = new Intersection(p0, segment, null, true));
	    clip.push(x.o = new Intersection(p0, null, x, false));
	    subject.push(x = new Intersection(p1, segment, null, false));
	    clip.push(x.o = new Intersection(p1, null, x, true));
	  });

	  if (!subject.length) return;

	  clip.sort(compareIntersection);
	  link$1(subject);
	  link$1(clip);

	  for (i = 0, n = clip.length; i < n; ++i) {
	    clip[i].e = startInside = !startInside;
	  }

	  var start = subject[0],
	      points,
	      point;

	  while (1) {
	    // Find first unvisited intersection.
	    var current = start,
	        isSubject = true;
	    while (current.v) if ((current = current.n) === start) return;
	    points = current.z;
	    stream.lineStart();
	    do {
	      current.v = current.o.v = true;
	      if (current.e) {
	        if (isSubject) {
	          for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
	        } else {
	          interpolate(current.x, current.n.x, 1, stream);
	        }
	        current = current.n;
	      } else {
	        if (isSubject) {
	          points = current.p.z;
	          for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
	        } else {
	          interpolate(current.x, current.p.x, -1, stream);
	        }
	        current = current.p;
	      }
	      current = current.o;
	      points = current.z;
	      isSubject = !isSubject;
	    } while (!current.v);
	    stream.lineEnd();
	  }
	};

	function link$1(array) {
	  if (!(n = array.length)) return;
	  var n,
	      i = 0,
	      a = array[0],
	      b;
	  while (++i < n) {
	    a.n = b = array[i];
	    b.p = a;
	    a = b;
	  }
	  a.n = b = array[0];
	  b.p = a;
	}

	var clipMax = 1e9;
	var clipMin = -clipMax;

	// TODO Use d3-polygon’s polygonContains here for the ring check?
	// TODO Eliminate duplicate buffering in clipBuffer and polygon.push?

	function clipExtent(x0, y0, x1, y1) {

	  function visible(x, y) {
	    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
	  }

	  function interpolate(from, to, direction, stream) {
	    var a = 0, a1 = 0;
	    if (from == null
	        || (a = corner(from, direction)) !== (a1 = corner(to, direction))
	        || comparePoint(from, to) < 0 ^ direction > 0) {
	      do stream.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
	      while ((a = (a + direction + 4) % 4) !== a1);
	    } else {
	      stream.point(to[0], to[1]);
	    }
	  }

	  function corner(p, direction) {
	    return abs(p[0] - x0) < epsilon$2 ? direction > 0 ? 0 : 3
	        : abs(p[0] - x1) < epsilon$2 ? direction > 0 ? 2 : 1
	        : abs(p[1] - y0) < epsilon$2 ? direction > 0 ? 1 : 0
	        : direction > 0 ? 3 : 2; // abs(p[1] - y1) < epsilon
	  }

	  function compareIntersection(a, b) {
	    return comparePoint(a.x, b.x);
	  }

	  function comparePoint(a, b) {
	    var ca = corner(a, 1),
	        cb = corner(b, 1);
	    return ca !== cb ? ca - cb
	        : ca === 0 ? b[1] - a[1]
	        : ca === 1 ? a[0] - b[0]
	        : ca === 2 ? a[1] - b[1]
	        : b[0] - a[0];
	  }

	  return function(stream) {
	    var activeStream = stream,
	        bufferStream = clipBuffer(),
	        segments,
	        polygon,
	        ring,
	        x__, y__, v__, // first point
	        x_, y_, v_, // previous point
	        first,
	        clean;

	    var clipStream = {
	      point: point,
	      lineStart: lineStart,
	      lineEnd: lineEnd,
	      polygonStart: polygonStart,
	      polygonEnd: polygonEnd
	    };

	    function point(x, y) {
	      if (visible(x, y)) activeStream.point(x, y);
	    }

	    function polygonInside() {
	      var winding = 0;

	      for (var i = 0, n = polygon.length; i < n; ++i) {
	        for (var ring = polygon[i], j = 1, m = ring.length, point = ring[0], a0, a1, b0 = point[0], b1 = point[1]; j < m; ++j) {
	          a0 = b0, a1 = b1, point = ring[j], b0 = point[0], b1 = point[1];
	          if (a1 <= y1) { if (b1 > y1 && (b0 - a0) * (y1 - a1) > (b1 - a1) * (x0 - a0)) ++winding; }
	          else { if (b1 <= y1 && (b0 - a0) * (y1 - a1) < (b1 - a1) * (x0 - a0)) --winding; }
	        }
	      }

	      return winding;
	    }

	    // Buffer geometry within a polygon and then clip it en masse.
	    function polygonStart() {
	      activeStream = bufferStream, segments = [], polygon = [], clean = true;
	    }

	    function polygonEnd() {
	      var startInside = polygonInside(),
	          cleanInside = clean && startInside,
	          visible = (segments = merge(segments)).length;
	      if (cleanInside || visible) {
	        stream.polygonStart();
	        if (cleanInside) {
	          stream.lineStart();
	          interpolate(null, null, 1, stream);
	          stream.lineEnd();
	        }
	        if (visible) {
	          clipPolygon(segments, compareIntersection, startInside, interpolate, stream);
	        }
	        stream.polygonEnd();
	      }
	      activeStream = stream, segments = polygon = ring = null;
	    }

	    function lineStart() {
	      clipStream.point = linePoint;
	      if (polygon) polygon.push(ring = []);
	      first = true;
	      v_ = false;
	      x_ = y_ = NaN;
	    }

	    // TODO rather than special-case polygons, simply handle them separately.
	    // Ideally, coincident intersection points should be jittered to avoid
	    // clipping issues.
	    function lineEnd() {
	      if (segments) {
	        linePoint(x__, y__);
	        if (v__ && v_) bufferStream.rejoin();
	        segments.push(bufferStream.result());
	      }
	      clipStream.point = point;
	      if (v_) activeStream.lineEnd();
	    }

	    function linePoint(x, y) {
	      var v = visible(x, y);
	      if (polygon) ring.push([x, y]);
	      if (first) {
	        x__ = x, y__ = y, v__ = v;
	        first = false;
	        if (v) {
	          activeStream.lineStart();
	          activeStream.point(x, y);
	        }
	      } else {
	        if (v && v_) activeStream.point(x, y);
	        else {
	          var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))],
	              b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
	          if (clipLine(a, b, x0, y0, x1, y1)) {
	            if (!v_) {
	              activeStream.lineStart();
	              activeStream.point(a[0], a[1]);
	            }
	            activeStream.point(b[0], b[1]);
	            if (!v) activeStream.lineEnd();
	            clean = false;
	          } else if (v) {
	            activeStream.lineStart();
	            activeStream.point(x, y);
	            clean = false;
	          }
	        }
	      }
	      x_ = x, y_ = y, v_ = v;
	    }

	    return clipStream;
	  };
	}

	var extent$1 = function() {
	  var x0 = 0,
	      y0 = 0,
	      x1 = 960,
	      y1 = 500,
	      cache,
	      cacheStream,
	      clip;

	  return clip = {
	    stream: function(stream) {
	      return cache && cacheStream === stream ? cache : cache = clipExtent(x0, y0, x1, y1)(cacheStream = stream);
	    },
	    extent: function(_) {
	      return arguments.length ? (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1], cache = cacheStream = null, clip) : [[x0, y0], [x1, y1]];
	    }
	  };
	};

	var sum$1 = adder();

	var polygonContains = function(polygon, point) {
	  var lambda = point[0],
	      phi = point[1],
	      normal = [sin$1(lambda), -cos$1(lambda), 0],
	      angle = 0,
	      winding = 0;

	  sum$1.reset();

	  for (var i = 0, n = polygon.length; i < n; ++i) {
	    if (!(m = (ring = polygon[i]).length)) continue;
	    var ring,
	        m,
	        point0 = ring[m - 1],
	        lambda0 = point0[0],
	        phi0 = point0[1] / 2 + quarterPi,
	        sinPhi0 = sin$1(phi0),
	        cosPhi0 = cos$1(phi0);

	    for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
	      var point1 = ring[j],
	          lambda1 = point1[0],
	          phi1 = point1[1] / 2 + quarterPi,
	          sinPhi1 = sin$1(phi1),
	          cosPhi1 = cos$1(phi1),
	          delta = lambda1 - lambda0,
	          sign$$1 = delta >= 0 ? 1 : -1,
	          absDelta = sign$$1 * delta,
	          antimeridian = absDelta > pi$3,
	          k = sinPhi0 * sinPhi1;

	      sum$1.add(atan2(k * sign$$1 * sin$1(absDelta), cosPhi0 * cosPhi1 + k * cos$1(absDelta)));
	      angle += antimeridian ? delta + sign$$1 * tau$3 : delta;

	      // Are the longitudes either side of the point’s meridian (lambda),
	      // and are the latitudes smaller than the parallel (phi)?
	      if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
	        var arc = cartesianCross(cartesian(point0), cartesian(point1));
	        cartesianNormalizeInPlace(arc);
	        var intersection = cartesianCross(normal, arc);
	        cartesianNormalizeInPlace(intersection);
	        var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
	        if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
	          winding += antimeridian ^ delta >= 0 ? 1 : -1;
	        }
	      }
	    }
	  }

	  // First, determine whether the South pole is inside or outside:
	  //
	  // It is inside if:
	  // * the polygon winds around it in a clockwise direction.
	  // * the polygon does not (cumulatively) wind around it, but has a negative
	  //   (counter-clockwise) area.
	  //
	  // Second, count the (signed) number of times a segment crosses a lambda
	  // from the point to the South pole.  If it is zero, then the point is the
	  // same side as the South pole.

	  return (angle < -epsilon$2 || angle < epsilon$2 && sum$1 < -epsilon$2) ^ (winding & 1);
	};

	var lengthSum = adder();
	var lambda0$2;
	var sinPhi0$1;
	var cosPhi0$1;

	var lengthStream = {
	  sphere: noop$1,
	  point: noop$1,
	  lineStart: lengthLineStart,
	  lineEnd: noop$1,
	  polygonStart: noop$1,
	  polygonEnd: noop$1
	};

	function lengthLineStart() {
	  lengthStream.point = lengthPointFirst;
	  lengthStream.lineEnd = lengthLineEnd;
	}

	function lengthLineEnd() {
	  lengthStream.point = lengthStream.lineEnd = noop$1;
	}

	function lengthPointFirst(lambda, phi) {
	  lambda *= radians, phi *= radians;
	  lambda0$2 = lambda, sinPhi0$1 = sin$1(phi), cosPhi0$1 = cos$1(phi);
	  lengthStream.point = lengthPoint;
	}

	function lengthPoint(lambda, phi) {
	  lambda *= radians, phi *= radians;
	  var sinPhi = sin$1(phi),
	      cosPhi = cos$1(phi),
	      delta = abs(lambda - lambda0$2),
	      cosDelta = cos$1(delta),
	      sinDelta = sin$1(delta),
	      x = cosPhi * sinDelta,
	      y = cosPhi0$1 * sinPhi - sinPhi0$1 * cosPhi * cosDelta,
	      z = sinPhi0$1 * sinPhi + cosPhi0$1 * cosPhi * cosDelta;
	  lengthSum.add(atan2(sqrt(x * x + y * y), z));
	  lambda0$2 = lambda, sinPhi0$1 = sinPhi, cosPhi0$1 = cosPhi;
	}

	var length$1 = function(object) {
	  lengthSum.reset();
	  geoStream(object, lengthStream);
	  return +lengthSum;
	};

	var coordinates = [null, null];
	var object$1 = {type: "LineString", coordinates: coordinates};

	var distance = function(a, b) {
	  coordinates[0] = a;
	  coordinates[1] = b;
	  return length$1(object$1);
	};

	var containsObjectType = {
	  Feature: function(object, point) {
	    return containsGeometry(object.geometry, point);
	  },
	  FeatureCollection: function(object, point) {
	    var features = object.features, i = -1, n = features.length;
	    while (++i < n) if (containsGeometry(features[i].geometry, point)) return true;
	    return false;
	  }
	};

	var containsGeometryType = {
	  Sphere: function() {
	    return true;
	  },
	  Point: function(object, point) {
	    return containsPoint(object.coordinates, point);
	  },
	  MultiPoint: function(object, point) {
	    var coordinates = object.coordinates, i = -1, n = coordinates.length;
	    while (++i < n) if (containsPoint(coordinates[i], point)) return true;
	    return false;
	  },
	  LineString: function(object, point) {
	    return containsLine(object.coordinates, point);
	  },
	  MultiLineString: function(object, point) {
	    var coordinates = object.coordinates, i = -1, n = coordinates.length;
	    while (++i < n) if (containsLine(coordinates[i], point)) return true;
	    return false;
	  },
	  Polygon: function(object, point) {
	    return containsPolygon(object.coordinates, point);
	  },
	  MultiPolygon: function(object, point) {
	    var coordinates = object.coordinates, i = -1, n = coordinates.length;
	    while (++i < n) if (containsPolygon(coordinates[i], point)) return true;
	    return false;
	  },
	  GeometryCollection: function(object, point) {
	    var geometries = object.geometries, i = -1, n = geometries.length;
	    while (++i < n) if (containsGeometry(geometries[i], point)) return true;
	    return false;
	  }
	};

	function containsGeometry(geometry, point) {
	  return geometry && containsGeometryType.hasOwnProperty(geometry.type)
	      ? containsGeometryType[geometry.type](geometry, point)
	      : false;
	}

	function containsPoint(coordinates, point) {
	  return distance(coordinates, point) === 0;
	}

	function containsLine(coordinates, point) {
	  var ab = distance(coordinates[0], coordinates[1]),
	      ao = distance(coordinates[0], point),
	      ob = distance(point, coordinates[1]);
	  return ao + ob <= ab + epsilon$2;
	}

	function containsPolygon(coordinates, point) {
	  return !!polygonContains(coordinates.map(ringRadians), pointRadians(point));
	}

	function ringRadians(ring) {
	  return ring = ring.map(pointRadians), ring.pop(), ring;
	}

	function pointRadians(point) {
	  return [point[0] * radians, point[1] * radians];
	}

	var contains = function(object, point) {
	  return (object && containsObjectType.hasOwnProperty(object.type)
	      ? containsObjectType[object.type]
	      : containsGeometry)(object, point);
	};

	function graticuleX(y0, y1, dy) {
	  var y = sequence(y0, y1 - epsilon$2, dy).concat(y1);
	  return function(x) { return y.map(function(y) { return [x, y]; }); };
	}

	function graticuleY(x0, x1, dx) {
	  var x = sequence(x0, x1 - epsilon$2, dx).concat(x1);
	  return function(y) { return x.map(function(x) { return [x, y]; }); };
	}

	function graticule() {
	  var x1, x0, X1, X0,
	      y1, y0, Y1, Y0,
	      dx = 10, dy = dx, DX = 90, DY = 360,
	      x, y, X, Y,
	      precision = 2.5;

	  function graticule() {
	    return {type: "MultiLineString", coordinates: lines()};
	  }

	  function lines() {
	    return sequence(ceil(X0 / DX) * DX, X1, DX).map(X)
	        .concat(sequence(ceil(Y0 / DY) * DY, Y1, DY).map(Y))
	        .concat(sequence(ceil(x0 / dx) * dx, x1, dx).filter(function(x) { return abs(x % DX) > epsilon$2; }).map(x))
	        .concat(sequence(ceil(y0 / dy) * dy, y1, dy).filter(function(y) { return abs(y % DY) > epsilon$2; }).map(y));
	  }

	  graticule.lines = function() {
	    return lines().map(function(coordinates) { return {type: "LineString", coordinates: coordinates}; });
	  };

	  graticule.outline = function() {
	    return {
	      type: "Polygon",
	      coordinates: [
	        X(X0).concat(
	        Y(Y1).slice(1),
	        X(X1).reverse().slice(1),
	        Y(Y0).reverse().slice(1))
	      ]
	    };
	  };

	  graticule.extent = function(_) {
	    if (!arguments.length) return graticule.extentMinor();
	    return graticule.extentMajor(_).extentMinor(_);
	  };

	  graticule.extentMajor = function(_) {
	    if (!arguments.length) return [[X0, Y0], [X1, Y1]];
	    X0 = +_[0][0], X1 = +_[1][0];
	    Y0 = +_[0][1], Y1 = +_[1][1];
	    if (X0 > X1) _ = X0, X0 = X1, X1 = _;
	    if (Y0 > Y1) _ = Y0, Y0 = Y1, Y1 = _;
	    return graticule.precision(precision);
	  };

	  graticule.extentMinor = function(_) {
	    if (!arguments.length) return [[x0, y0], [x1, y1]];
	    x0 = +_[0][0], x1 = +_[1][0];
	    y0 = +_[0][1], y1 = +_[1][1];
	    if (x0 > x1) _ = x0, x0 = x1, x1 = _;
	    if (y0 > y1) _ = y0, y0 = y1, y1 = _;
	    return graticule.precision(precision);
	  };

	  graticule.step = function(_) {
	    if (!arguments.length) return graticule.stepMinor();
	    return graticule.stepMajor(_).stepMinor(_);
	  };

	  graticule.stepMajor = function(_) {
	    if (!arguments.length) return [DX, DY];
	    DX = +_[0], DY = +_[1];
	    return graticule;
	  };

	  graticule.stepMinor = function(_) {
	    if (!arguments.length) return [dx, dy];
	    dx = +_[0], dy = +_[1];
	    return graticule;
	  };

	  graticule.precision = function(_) {
	    if (!arguments.length) return precision;
	    precision = +_;
	    x = graticuleX(y0, y1, 90);
	    y = graticuleY(x0, x1, precision);
	    X = graticuleX(Y0, Y1, 90);
	    Y = graticuleY(X0, X1, precision);
	    return graticule;
	  };

	  return graticule
	      .extentMajor([[-180, -90 + epsilon$2], [180, 90 - epsilon$2]])
	      .extentMinor([[-180, -80 - epsilon$2], [180, 80 + epsilon$2]]);
	}

	function graticule10() {
	  return graticule()();
	}

	var interpolate$1 = function(a, b) {
	  var x0 = a[0] * radians,
	      y0 = a[1] * radians,
	      x1 = b[0] * radians,
	      y1 = b[1] * radians,
	      cy0 = cos$1(y0),
	      sy0 = sin$1(y0),
	      cy1 = cos$1(y1),
	      sy1 = sin$1(y1),
	      kx0 = cy0 * cos$1(x0),
	      ky0 = cy0 * sin$1(x0),
	      kx1 = cy1 * cos$1(x1),
	      ky1 = cy1 * sin$1(x1),
	      d = 2 * asin(sqrt(haversin(y1 - y0) + cy0 * cy1 * haversin(x1 - x0))),
	      k = sin$1(d);

	  var interpolate = d ? function(t) {
	    var B = sin$1(t *= d) / k,
	        A = sin$1(d - t) / k,
	        x = A * kx0 + B * kx1,
	        y = A * ky0 + B * ky1,
	        z = A * sy0 + B * sy1;
	    return [
	      atan2(y, x) * degrees$1,
	      atan2(z, sqrt(x * x + y * y)) * degrees$1
	    ];
	  } : function() {
	    return [x0 * degrees$1, y0 * degrees$1];
	  };

	  interpolate.distance = d;

	  return interpolate;
	};

	var identity$4 = function(x) {
	  return x;
	};

	var areaSum$1 = adder();
	var areaRingSum$1 = adder();
	var x00;
	var y00;
	var x0$1;
	var y0$1;

	var areaStream$1 = {
	  point: noop$1,
	  lineStart: noop$1,
	  lineEnd: noop$1,
	  polygonStart: function() {
	    areaStream$1.lineStart = areaRingStart$1;
	    areaStream$1.lineEnd = areaRingEnd$1;
	  },
	  polygonEnd: function() {
	    areaStream$1.lineStart = areaStream$1.lineEnd = areaStream$1.point = noop$1;
	    areaSum$1.add(abs(areaRingSum$1));
	    areaRingSum$1.reset();
	  },
	  result: function() {
	    var area = areaSum$1 / 2;
	    areaSum$1.reset();
	    return area;
	  }
	};

	function areaRingStart$1() {
	  areaStream$1.point = areaPointFirst$1;
	}

	function areaPointFirst$1(x, y) {
	  areaStream$1.point = areaPoint$1;
	  x00 = x0$1 = x, y00 = y0$1 = y;
	}

	function areaPoint$1(x, y) {
	  areaRingSum$1.add(y0$1 * x - x0$1 * y);
	  x0$1 = x, y0$1 = y;
	}

	function areaRingEnd$1() {
	  areaPoint$1(x00, y00);
	}

	var x0$2 = Infinity;
	var y0$2 = x0$2;
	var x1 = -x0$2;
	var y1 = x1;

	var boundsStream$1 = {
	  point: boundsPoint$1,
	  lineStart: noop$1,
	  lineEnd: noop$1,
	  polygonStart: noop$1,
	  polygonEnd: noop$1,
	  result: function() {
	    var bounds = [[x0$2, y0$2], [x1, y1]];
	    x1 = y1 = -(y0$2 = x0$2 = Infinity);
	    return bounds;
	  }
	};

	function boundsPoint$1(x, y) {
	  if (x < x0$2) x0$2 = x;
	  if (x > x1) x1 = x;
	  if (y < y0$2) y0$2 = y;
	  if (y > y1) y1 = y;
	}

	// TODO Enforce positive area for exterior, negative area for interior?

	var X0$1 = 0;
	var Y0$1 = 0;
	var Z0$1 = 0;
	var X1$1 = 0;
	var Y1$1 = 0;
	var Z1$1 = 0;
	var X2$1 = 0;
	var Y2$1 = 0;
	var Z2$1 = 0;
	var x00$1;
	var y00$1;
	var x0$3;
	var y0$3;

	var centroidStream$1 = {
	  point: centroidPoint$1,
	  lineStart: centroidLineStart$1,
	  lineEnd: centroidLineEnd$1,
	  polygonStart: function() {
	    centroidStream$1.lineStart = centroidRingStart$1;
	    centroidStream$1.lineEnd = centroidRingEnd$1;
	  },
	  polygonEnd: function() {
	    centroidStream$1.point = centroidPoint$1;
	    centroidStream$1.lineStart = centroidLineStart$1;
	    centroidStream$1.lineEnd = centroidLineEnd$1;
	  },
	  result: function() {
	    var centroid = Z2$1 ? [X2$1 / Z2$1, Y2$1 / Z2$1]
	        : Z1$1 ? [X1$1 / Z1$1, Y1$1 / Z1$1]
	        : Z0$1 ? [X0$1 / Z0$1, Y0$1 / Z0$1]
	        : [NaN, NaN];
	    X0$1 = Y0$1 = Z0$1 =
	    X1$1 = Y1$1 = Z1$1 =
	    X2$1 = Y2$1 = Z2$1 = 0;
	    return centroid;
	  }
	};

	function centroidPoint$1(x, y) {
	  X0$1 += x;
	  Y0$1 += y;
	  ++Z0$1;
	}

	function centroidLineStart$1() {
	  centroidStream$1.point = centroidPointFirstLine;
	}

	function centroidPointFirstLine(x, y) {
	  centroidStream$1.point = centroidPointLine;
	  centroidPoint$1(x0$3 = x, y0$3 = y);
	}

	function centroidPointLine(x, y) {
	  var dx = x - x0$3, dy = y - y0$3, z = sqrt(dx * dx + dy * dy);
	  X1$1 += z * (x0$3 + x) / 2;
	  Y1$1 += z * (y0$3 + y) / 2;
	  Z1$1 += z;
	  centroidPoint$1(x0$3 = x, y0$3 = y);
	}

	function centroidLineEnd$1() {
	  centroidStream$1.point = centroidPoint$1;
	}

	function centroidRingStart$1() {
	  centroidStream$1.point = centroidPointFirstRing;
	}

	function centroidRingEnd$1() {
	  centroidPointRing(x00$1, y00$1);
	}

	function centroidPointFirstRing(x, y) {
	  centroidStream$1.point = centroidPointRing;
	  centroidPoint$1(x00$1 = x0$3 = x, y00$1 = y0$3 = y);
	}

	function centroidPointRing(x, y) {
	  var dx = x - x0$3,
	      dy = y - y0$3,
	      z = sqrt(dx * dx + dy * dy);

	  X1$1 += z * (x0$3 + x) / 2;
	  Y1$1 += z * (y0$3 + y) / 2;
	  Z1$1 += z;

	  z = y0$3 * x - x0$3 * y;
	  X2$1 += z * (x0$3 + x);
	  Y2$1 += z * (y0$3 + y);
	  Z2$1 += z * 3;
	  centroidPoint$1(x0$3 = x, y0$3 = y);
	}

	function PathContext(context) {
	  this._context = context;
	}

	PathContext.prototype = {
	  _radius: 4.5,
	  pointRadius: function(_) {
	    return this._radius = _, this;
	  },
	  polygonStart: function() {
	    this._line = 0;
	  },
	  polygonEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (this._line === 0) this._context.closePath();
	    this._point = NaN;
	  },
	  point: function(x, y) {
	    switch (this._point) {
	      case 0: {
	        this._context.moveTo(x, y);
	        this._point = 1;
	        break;
	      }
	      case 1: {
	        this._context.lineTo(x, y);
	        break;
	      }
	      default: {
	        this._context.moveTo(x + this._radius, y);
	        this._context.arc(x, y, this._radius, 0, tau$3);
	        break;
	      }
	    }
	  },
	  result: noop$1
	};

	var lengthSum$1 = adder();
	var lengthRing;
	var x00$2;
	var y00$2;
	var x0$4;
	var y0$4;

	var lengthStream$1 = {
	  point: noop$1,
	  lineStart: function() {
	    lengthStream$1.point = lengthPointFirst$1;
	  },
	  lineEnd: function() {
	    if (lengthRing) lengthPoint$1(x00$2, y00$2);
	    lengthStream$1.point = noop$1;
	  },
	  polygonStart: function() {
	    lengthRing = true;
	  },
	  polygonEnd: function() {
	    lengthRing = null;
	  },
	  result: function() {
	    var length = +lengthSum$1;
	    lengthSum$1.reset();
	    return length;
	  }
	};

	function lengthPointFirst$1(x, y) {
	  lengthStream$1.point = lengthPoint$1;
	  x00$2 = x0$4 = x, y00$2 = y0$4 = y;
	}

	function lengthPoint$1(x, y) {
	  x0$4 -= x, y0$4 -= y;
	  lengthSum$1.add(sqrt(x0$4 * x0$4 + y0$4 * y0$4));
	  x0$4 = x, y0$4 = y;
	}

	function PathString() {
	  this._string = [];
	}

	PathString.prototype = {
	  _circle: circle$1(4.5),
	  pointRadius: function(_) {
	    return this._circle = circle$1(_), this;
	  },
	  polygonStart: function() {
	    this._line = 0;
	  },
	  polygonEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (this._line === 0) this._string.push("Z");
	    this._point = NaN;
	  },
	  point: function(x, y) {
	    switch (this._point) {
	      case 0: {
	        this._string.push("M", x, ",", y);
	        this._point = 1;
	        break;
	      }
	      case 1: {
	        this._string.push("L", x, ",", y);
	        break;
	      }
	      default: {
	        this._string.push("M", x, ",", y, this._circle);
	        break;
	      }
	    }
	  },
	  result: function() {
	    if (this._string.length) {
	      var result = this._string.join("");
	      this._string = [];
	      return result;
	    }
	  }
	};

	function circle$1(radius) {
	  return "m0," + radius
	      + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius
	      + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius
	      + "z";
	}

	var index$1 = function(projection, context) {
	  var pointRadius = 4.5,
	      projectionStream,
	      contextStream;

	  function path(object) {
	    if (object) {
	      if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
	      geoStream(object, projectionStream(contextStream));
	    }
	    return contextStream.result();
	  }

	  path.area = function(object) {
	    geoStream(object, projectionStream(areaStream$1));
	    return areaStream$1.result();
	  };

	  path.measure = function(object) {
	    geoStream(object, projectionStream(lengthStream$1));
	    return lengthStream$1.result();
	  };

	  path.bounds = function(object) {
	    geoStream(object, projectionStream(boundsStream$1));
	    return boundsStream$1.result();
	  };

	  path.centroid = function(object) {
	    geoStream(object, projectionStream(centroidStream$1));
	    return centroidStream$1.result();
	  };

	  path.projection = function(_) {
	    return arguments.length ? (projectionStream = _ == null ? (projection = null, identity$4) : (projection = _).stream, path) : projection;
	  };

	  path.context = function(_) {
	    if (!arguments.length) return context;
	    contextStream = _ == null ? (context = null, new PathString) : new PathContext(context = _);
	    if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
	    return path;
	  };

	  path.pointRadius = function(_) {
	    if (!arguments.length) return pointRadius;
	    pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
	    return path;
	  };

	  return path.projection(projection).context(context);
	};

	var clip = function(pointVisible, clipLine, interpolate, start) {
	  return function(rotate, sink) {
	    var line = clipLine(sink),
	        rotatedStart = rotate.invert(start[0], start[1]),
	        ringBuffer = clipBuffer(),
	        ringSink = clipLine(ringBuffer),
	        polygonStarted = false,
	        polygon,
	        segments,
	        ring;

	    var clip = {
	      point: point,
	      lineStart: lineStart,
	      lineEnd: lineEnd,
	      polygonStart: function() {
	        clip.point = pointRing;
	        clip.lineStart = ringStart;
	        clip.lineEnd = ringEnd;
	        segments = [];
	        polygon = [];
	      },
	      polygonEnd: function() {
	        clip.point = point;
	        clip.lineStart = lineStart;
	        clip.lineEnd = lineEnd;
	        segments = merge(segments);
	        var startInside = polygonContains(polygon, rotatedStart);
	        if (segments.length) {
	          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
	          clipPolygon(segments, compareIntersection, startInside, interpolate, sink);
	        } else if (startInside) {
	          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
	          sink.lineStart();
	          interpolate(null, null, 1, sink);
	          sink.lineEnd();
	        }
	        if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
	        segments = polygon = null;
	      },
	      sphere: function() {
	        sink.polygonStart();
	        sink.lineStart();
	        interpolate(null, null, 1, sink);
	        sink.lineEnd();
	        sink.polygonEnd();
	      }
	    };

	    function point(lambda, phi) {
	      var point = rotate(lambda, phi);
	      if (pointVisible(lambda = point[0], phi = point[1])) sink.point(lambda, phi);
	    }

	    function pointLine(lambda, phi) {
	      var point = rotate(lambda, phi);
	      line.point(point[0], point[1]);
	    }

	    function lineStart() {
	      clip.point = pointLine;
	      line.lineStart();
	    }

	    function lineEnd() {
	      clip.point = point;
	      line.lineEnd();
	    }

	    function pointRing(lambda, phi) {
	      ring.push([lambda, phi]);
	      var point = rotate(lambda, phi);
	      ringSink.point(point[0], point[1]);
	    }

	    function ringStart() {
	      ringSink.lineStart();
	      ring = [];
	    }

	    function ringEnd() {
	      pointRing(ring[0][0], ring[0][1]);
	      ringSink.lineEnd();

	      var clean = ringSink.clean(),
	          ringSegments = ringBuffer.result(),
	          i, n = ringSegments.length, m,
	          segment,
	          point;

	      ring.pop();
	      polygon.push(ring);
	      ring = null;

	      if (!n) return;

	      // No intersections.
	      if (clean & 1) {
	        segment = ringSegments[0];
	        if ((m = segment.length - 1) > 0) {
	          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
	          sink.lineStart();
	          for (i = 0; i < m; ++i) sink.point((point = segment[i])[0], point[1]);
	          sink.lineEnd();
	        }
	        return;
	      }

	      // Rejoin connected segments.
	      // TODO reuse ringBuffer.rejoin()?
	      if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

	      segments.push(ringSegments.filter(validSegment));
	    }

	    return clip;
	  };
	};

	function validSegment(segment) {
	  return segment.length > 1;
	}

	// Intersections are sorted along the clip edge. For both antimeridian cutting
	// and circle clipping, the same comparison is used.
	function compareIntersection(a, b) {
	  return ((a = a.x)[0] < 0 ? a[1] - halfPi$2 - epsilon$2 : halfPi$2 - a[1])
	       - ((b = b.x)[0] < 0 ? b[1] - halfPi$2 - epsilon$2 : halfPi$2 - b[1]);
	}

	var clipAntimeridian = clip(
	  function() { return true; },
	  clipAntimeridianLine,
	  clipAntimeridianInterpolate,
	  [-pi$3, -halfPi$2]
	);

	// Takes a line and cuts into visible segments. Return values: 0 - there were
	// intersections or the line was empty; 1 - no intersections; 2 - there were
	// intersections, and the first and last segments should be rejoined.
	function clipAntimeridianLine(stream) {
	  var lambda0 = NaN,
	      phi0 = NaN,
	      sign0 = NaN,
	      clean; // no intersections

	  return {
	    lineStart: function() {
	      stream.lineStart();
	      clean = 1;
	    },
	    point: function(lambda1, phi1) {
	      var sign1 = lambda1 > 0 ? pi$3 : -pi$3,
	          delta = abs(lambda1 - lambda0);
	      if (abs(delta - pi$3) < epsilon$2) { // line crosses a pole
	        stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi$2 : -halfPi$2);
	        stream.point(sign0, phi0);
	        stream.lineEnd();
	        stream.lineStart();
	        stream.point(sign1, phi0);
	        stream.point(lambda1, phi0);
	        clean = 0;
	      } else if (sign0 !== sign1 && delta >= pi$3) { // line crosses antimeridian
	        if (abs(lambda0 - sign0) < epsilon$2) lambda0 -= sign0 * epsilon$2; // handle degeneracies
	        if (abs(lambda1 - sign1) < epsilon$2) lambda1 -= sign1 * epsilon$2;
	        phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
	        stream.point(sign0, phi0);
	        stream.lineEnd();
	        stream.lineStart();
	        stream.point(sign1, phi0);
	        clean = 0;
	      }
	      stream.point(lambda0 = lambda1, phi0 = phi1);
	      sign0 = sign1;
	    },
	    lineEnd: function() {
	      stream.lineEnd();
	      lambda0 = phi0 = NaN;
	    },
	    clean: function() {
	      return 2 - clean; // if intersections, rejoin first and last segments
	    }
	  };
	}

	function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
	  var cosPhi0,
	      cosPhi1,
	      sinLambda0Lambda1 = sin$1(lambda0 - lambda1);
	  return abs(sinLambda0Lambda1) > epsilon$2
	      ? atan((sin$1(phi0) * (cosPhi1 = cos$1(phi1)) * sin$1(lambda1)
	          - sin$1(phi1) * (cosPhi0 = cos$1(phi0)) * sin$1(lambda0))
	          / (cosPhi0 * cosPhi1 * sinLambda0Lambda1))
	      : (phi0 + phi1) / 2;
	}

	function clipAntimeridianInterpolate(from, to, direction, stream) {
	  var phi;
	  if (from == null) {
	    phi = direction * halfPi$2;
	    stream.point(-pi$3, phi);
	    stream.point(0, phi);
	    stream.point(pi$3, phi);
	    stream.point(pi$3, 0);
	    stream.point(pi$3, -phi);
	    stream.point(0, -phi);
	    stream.point(-pi$3, -phi);
	    stream.point(-pi$3, 0);
	    stream.point(-pi$3, phi);
	  } else if (abs(from[0] - to[0]) > epsilon$2) {
	    var lambda = from[0] < to[0] ? pi$3 : -pi$3;
	    phi = direction * lambda / 2;
	    stream.point(-lambda, phi);
	    stream.point(0, phi);
	    stream.point(lambda, phi);
	  } else {
	    stream.point(to[0], to[1]);
	  }
	}

	var clipCircle = function(radius, delta) {
	  var cr = cos$1(radius),
	      smallRadius = cr > 0,
	      notHemisphere = abs(cr) > epsilon$2; // TODO optimise for this common case

	  function interpolate(from, to, direction, stream) {
	    circleStream(stream, radius, delta, direction, from, to);
	  }

	  function visible(lambda, phi) {
	    return cos$1(lambda) * cos$1(phi) > cr;
	  }

	  // Takes a line and cuts into visible segments. Return values used for polygon
	  // clipping: 0 - there were intersections or the line was empty; 1 - no
	  // intersections 2 - there were intersections, and the first and last segments
	  // should be rejoined.
	  function clipLine(stream) {
	    var point0, // previous point
	        c0, // code for previous point
	        v0, // visibility of previous point
	        v00, // visibility of first point
	        clean; // no intersections
	    return {
	      lineStart: function() {
	        v00 = v0 = false;
	        clean = 1;
	      },
	      point: function(lambda, phi) {
	        var point1 = [lambda, phi],
	            point2,
	            v = visible(lambda, phi),
	            c = smallRadius
	              ? v ? 0 : code(lambda, phi)
	              : v ? code(lambda + (lambda < 0 ? pi$3 : -pi$3), phi) : 0;
	        if (!point0 && (v00 = v0 = v)) stream.lineStart();
	        // Handle degeneracies.
	        // TODO ignore if not clipping polygons.
	        if (v !== v0) {
	          point2 = intersect(point0, point1);
	          if (pointEqual(point0, point2) || pointEqual(point1, point2)) {
	            point1[0] += epsilon$2;
	            point1[1] += epsilon$2;
	            v = visible(point1[0], point1[1]);
	          }
	        }
	        if (v !== v0) {
	          clean = 0;
	          if (v) {
	            // outside going in
	            stream.lineStart();
	            point2 = intersect(point1, point0);
	            stream.point(point2[0], point2[1]);
	          } else {
	            // inside going out
	            point2 = intersect(point0, point1);
	            stream.point(point2[0], point2[1]);
	            stream.lineEnd();
	          }
	          point0 = point2;
	        } else if (notHemisphere && point0 && smallRadius ^ v) {
	          var t;
	          // If the codes for two points are different, or are both zero,
	          // and there this segment intersects with the small circle.
	          if (!(c & c0) && (t = intersect(point1, point0, true))) {
	            clean = 0;
	            if (smallRadius) {
	              stream.lineStart();
	              stream.point(t[0][0], t[0][1]);
	              stream.point(t[1][0], t[1][1]);
	              stream.lineEnd();
	            } else {
	              stream.point(t[1][0], t[1][1]);
	              stream.lineEnd();
	              stream.lineStart();
	              stream.point(t[0][0], t[0][1]);
	            }
	          }
	        }
	        if (v && (!point0 || !pointEqual(point0, point1))) {
	          stream.point(point1[0], point1[1]);
	        }
	        point0 = point1, v0 = v, c0 = c;
	      },
	      lineEnd: function() {
	        if (v0) stream.lineEnd();
	        point0 = null;
	      },
	      // Rejoin first and last segments if there were intersections and the first
	      // and last points were visible.
	      clean: function() {
	        return clean | ((v00 && v0) << 1);
	      }
	    };
	  }

	  // Intersects the great circle between a and b with the clip circle.
	  function intersect(a, b, two) {
	    var pa = cartesian(a),
	        pb = cartesian(b);

	    // We have two planes, n1.p = d1 and n2.p = d2.
	    // Find intersection line p(t) = c1 n1 + c2 n2 + t (n1 ⨯ n2).
	    var n1 = [1, 0, 0], // normal
	        n2 = cartesianCross(pa, pb),
	        n2n2 = cartesianDot(n2, n2),
	        n1n2 = n2[0], // cartesianDot(n1, n2),
	        determinant = n2n2 - n1n2 * n1n2;

	    // Two polar points.
	    if (!determinant) return !two && a;

	    var c1 =  cr * n2n2 / determinant,
	        c2 = -cr * n1n2 / determinant,
	        n1xn2 = cartesianCross(n1, n2),
	        A = cartesianScale(n1, c1),
	        B = cartesianScale(n2, c2);
	    cartesianAddInPlace(A, B);

	    // Solve |p(t)|^2 = 1.
	    var u = n1xn2,
	        w = cartesianDot(A, u),
	        uu = cartesianDot(u, u),
	        t2 = w * w - uu * (cartesianDot(A, A) - 1);

	    if (t2 < 0) return;

	    var t = sqrt(t2),
	        q = cartesianScale(u, (-w - t) / uu);
	    cartesianAddInPlace(q, A);
	    q = spherical(q);

	    if (!two) return q;

	    // Two intersection points.
	    var lambda0 = a[0],
	        lambda1 = b[0],
	        phi0 = a[1],
	        phi1 = b[1],
	        z;

	    if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;

	    var delta = lambda1 - lambda0,
	        polar = abs(delta - pi$3) < epsilon$2,
	        meridian = polar || delta < epsilon$2;

	    if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;

	    // Check that the first point is between a and b.
	    if (meridian
	        ? polar
	          ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon$2 ? phi0 : phi1)
	          : phi0 <= q[1] && q[1] <= phi1
	        : delta > pi$3 ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
	      var q1 = cartesianScale(u, (-w + t) / uu);
	      cartesianAddInPlace(q1, A);
	      return [q, spherical(q1)];
	    }
	  }

	  // Generates a 4-bit vector representing the location of a point relative to
	  // the small circle's bounding box.
	  function code(lambda, phi) {
	    var r = smallRadius ? radius : pi$3 - radius,
	        code = 0;
	    if (lambda < -r) code |= 1; // left
	    else if (lambda > r) code |= 2; // right
	    if (phi < -r) code |= 4; // below
	    else if (phi > r) code |= 8; // above
	    return code;
	  }

	  return clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi$3, radius - pi$3]);
	};

	var transform = function(methods) {
	  return {
	    stream: transformer(methods)
	  };
	};

	function transformer(methods) {
	  return function(stream) {
	    var s = new TransformStream;
	    for (var key in methods) s[key] = methods[key];
	    s.stream = stream;
	    return s;
	  };
	}

	function TransformStream() {}

	TransformStream.prototype = {
	  constructor: TransformStream,
	  point: function(x, y) { this.stream.point(x, y); },
	  sphere: function() { this.stream.sphere(); },
	  lineStart: function() { this.stream.lineStart(); },
	  lineEnd: function() { this.stream.lineEnd(); },
	  polygonStart: function() { this.stream.polygonStart(); },
	  polygonEnd: function() { this.stream.polygonEnd(); }
	};

	function fitExtent(projection, extent, object) {
	  var w = extent[1][0] - extent[0][0],
	      h = extent[1][1] - extent[0][1],
	      clip = projection.clipExtent && projection.clipExtent();

	  projection
	      .scale(150)
	      .translate([0, 0]);

	  if (clip != null) projection.clipExtent(null);

	  geoStream(object, projection.stream(boundsStream$1));

	  var b = boundsStream$1.result(),
	      k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
	      x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
	      y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;

	  if (clip != null) projection.clipExtent(clip);

	  return projection
	      .scale(k * 150)
	      .translate([x, y]);
	}

	function fitSize(projection, size, object) {
	  return fitExtent(projection, [[0, 0], size], object);
	}

	var maxDepth = 16;
	var cosMinDistance = cos$1(30 * radians); // cos(minimum angular distance)

	var resample = function(project, delta2) {
	  return +delta2 ? resample$1(project, delta2) : resampleNone(project);
	};

	function resampleNone(project) {
	  return transformer({
	    point: function(x, y) {
	      x = project(x, y);
	      this.stream.point(x[0], x[1]);
	    }
	  });
	}

	function resample$1(project, delta2) {

	  function resampleLineTo(x0, y0, lambda0, a0, b0, c0, x1, y1, lambda1, a1, b1, c1, depth, stream) {
	    var dx = x1 - x0,
	        dy = y1 - y0,
	        d2 = dx * dx + dy * dy;
	    if (d2 > 4 * delta2 && depth--) {
	      var a = a0 + a1,
	          b = b0 + b1,
	          c = c0 + c1,
	          m = sqrt(a * a + b * b + c * c),
	          phi2 = asin(c /= m),
	          lambda2 = abs(abs(c) - 1) < epsilon$2 || abs(lambda0 - lambda1) < epsilon$2 ? (lambda0 + lambda1) / 2 : atan2(b, a),
	          p = project(lambda2, phi2),
	          x2 = p[0],
	          y2 = p[1],
	          dx2 = x2 - x0,
	          dy2 = y2 - y0,
	          dz = dy * dx2 - dx * dy2;
	      if (dz * dz / d2 > delta2 // perpendicular projected distance
	          || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 // midpoint close to an end
	          || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) { // angular distance
	        resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
	        stream.point(x2, y2);
	        resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream);
	      }
	    }
	  }
	  return function(stream) {
	    var lambda00, x00, y00, a00, b00, c00, // first point
	        lambda0, x0, y0, a0, b0, c0; // previous point

	    var resampleStream = {
	      point: point,
	      lineStart: lineStart,
	      lineEnd: lineEnd,
	      polygonStart: function() { stream.polygonStart(); resampleStream.lineStart = ringStart; },
	      polygonEnd: function() { stream.polygonEnd(); resampleStream.lineStart = lineStart; }
	    };

	    function point(x, y) {
	      x = project(x, y);
	      stream.point(x[0], x[1]);
	    }

	    function lineStart() {
	      x0 = NaN;
	      resampleStream.point = linePoint;
	      stream.lineStart();
	    }

	    function linePoint(lambda, phi) {
	      var c = cartesian([lambda, phi]), p = project(lambda, phi);
	      resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
	      stream.point(x0, y0);
	    }

	    function lineEnd() {
	      resampleStream.point = point;
	      stream.lineEnd();
	    }

	    function ringStart() {
	      lineStart();
	      resampleStream.point = ringPoint;
	      resampleStream.lineEnd = ringEnd;
	    }

	    function ringPoint(lambda, phi) {
	      linePoint(lambda00 = lambda, phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
	      resampleStream.point = linePoint;
	    }

	    function ringEnd() {
	      resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream);
	      resampleStream.lineEnd = lineEnd;
	      lineEnd();
	    }

	    return resampleStream;
	  };
	}

	var transformRadians = transformer({
	  point: function(x, y) {
	    this.stream.point(x * radians, y * radians);
	  }
	});

	function projection(project) {
	  return projectionMutator(function() { return project; })();
	}

	function projectionMutator(projectAt) {
	  var project,
	      k = 150, // scale
	      x = 480, y = 250, // translate
	      dx, dy, lambda = 0, phi = 0, // center
	      deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, projectRotate, // rotate
	      theta = null, preclip = clipAntimeridian, // clip angle
	      x0 = null, y0, x1, y1, postclip = identity$4, // clip extent
	      delta2 = 0.5, projectResample = resample(projectTransform, delta2), // precision
	      cache,
	      cacheStream;

	  function projection(point) {
	    point = projectRotate(point[0] * radians, point[1] * radians);
	    return [point[0] * k + dx, dy - point[1] * k];
	  }

	  function invert(point) {
	    point = projectRotate.invert((point[0] - dx) / k, (dy - point[1]) / k);
	    return point && [point[0] * degrees$1, point[1] * degrees$1];
	  }

	  function projectTransform(x, y) {
	    return x = project(x, y), [x[0] * k + dx, dy - x[1] * k];
	  }

	  projection.stream = function(stream) {
	    return cache && cacheStream === stream ? cache : cache = transformRadians(preclip(rotate, projectResample(postclip(cacheStream = stream))));
	  };

	  projection.clipAngle = function(_) {
	    return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians, 6 * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees$1;
	  };

	  projection.clipExtent = function(_) {
	    return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity$4) : clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
	  };

	  projection.scale = function(_) {
	    return arguments.length ? (k = +_, recenter()) : k;
	  };

	  projection.translate = function(_) {
	    return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
	  };

	  projection.center = function(_) {
	    return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees$1, phi * degrees$1];
	  };

	  projection.rotate = function(_) {
	    return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees$1, deltaPhi * degrees$1, deltaGamma * degrees$1];
	  };

	  projection.precision = function(_) {
	    return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
	  };

	  projection.fitExtent = function(extent, object) {
	    return fitExtent(projection, extent, object);
	  };

	  projection.fitSize = function(size, object) {
	    return fitSize(projection, size, object);
	  };

	  function recenter() {
	    projectRotate = compose(rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma), project);
	    var center = project(lambda, phi);
	    dx = x - center[0] * k;
	    dy = y + center[1] * k;
	    return reset();
	  }

	  function reset() {
	    cache = cacheStream = null;
	    return projection;
	  }

	  return function() {
	    project = projectAt.apply(this, arguments);
	    projection.invert = project.invert && invert;
	    return recenter();
	  };
	}

	function conicProjection(projectAt) {
	  var phi0 = 0,
	      phi1 = pi$3 / 3,
	      m = projectionMutator(projectAt),
	      p = m(phi0, phi1);

	  p.parallels = function(_) {
	    return arguments.length ? m(phi0 = _[0] * radians, phi1 = _[1] * radians) : [phi0 * degrees$1, phi1 * degrees$1];
	  };

	  return p;
	}

	function cylindricalEqualAreaRaw(phi0) {
	  var cosPhi0 = cos$1(phi0);

	  function forward(lambda, phi) {
	    return [lambda * cosPhi0, sin$1(phi) / cosPhi0];
	  }

	  forward.invert = function(x, y) {
	    return [x / cosPhi0, asin(y * cosPhi0)];
	  };

	  return forward;
	}

	function conicEqualAreaRaw(y0, y1) {
	  var sy0 = sin$1(y0), n = (sy0 + sin$1(y1)) / 2;

	  // Are the parallels symmetrical around the Equator?
	  if (abs(n) < epsilon$2) return cylindricalEqualAreaRaw(y0);

	  var c = 1 + sy0 * (2 * n - sy0), r0 = sqrt(c) / n;

	  function project(x, y) {
	    var r = sqrt(c - 2 * n * sin$1(y)) / n;
	    return [r * sin$1(x *= n), r0 - r * cos$1(x)];
	  }

	  project.invert = function(x, y) {
	    var r0y = r0 - y;
	    return [atan2(x, abs(r0y)) / n * sign(r0y), asin((c - (x * x + r0y * r0y) * n * n) / (2 * n))];
	  };

	  return project;
	}

	var conicEqualArea = function() {
	  return conicProjection(conicEqualAreaRaw)
	      .scale(155.424)
	      .center([0, 33.6442]);
	};

	var albers = function() {
	  return conicEqualArea()
	      .parallels([29.5, 45.5])
	      .scale(1070)
	      .translate([480, 250])
	      .rotate([96, 0])
	      .center([-0.6, 38.7]);
	};

	// The projections must have mutually exclusive clip regions on the sphere,
	// as this will avoid emitting interleaving lines and polygons.
	function multiplex(streams) {
	  var n = streams.length;
	  return {
	    point: function(x, y) { var i = -1; while (++i < n) streams[i].point(x, y); },
	    sphere: function() { var i = -1; while (++i < n) streams[i].sphere(); },
	    lineStart: function() { var i = -1; while (++i < n) streams[i].lineStart(); },
	    lineEnd: function() { var i = -1; while (++i < n) streams[i].lineEnd(); },
	    polygonStart: function() { var i = -1; while (++i < n) streams[i].polygonStart(); },
	    polygonEnd: function() { var i = -1; while (++i < n) streams[i].polygonEnd(); }
	  };
	}

	// A composite projection for the United States, configured by default for
	// 960×500. The projection also works quite well at 960×600 if you change the
	// scale to 1285 and adjust the translate accordingly. The set of standard
	// parallels for each region comes from USGS, which is published here:
	// http://egsc.usgs.gov/isb/pubs/MapProjections/projections.html#albers
	var albersUsa = function() {
	  var cache,
	      cacheStream,
	      lower48 = albers(), lower48Point,
	      alaska = conicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]), alaskaPoint, // EPSG:3338
	      hawaii = conicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]), hawaiiPoint, // ESRI:102007
	      point, pointStream = {point: function(x, y) { point = [x, y]; }};

	  function albersUsa(coordinates) {
	    var x = coordinates[0], y = coordinates[1];
	    return point = null,
	        (lower48Point.point(x, y), point)
	        || (alaskaPoint.point(x, y), point)
	        || (hawaiiPoint.point(x, y), point);
	  }

	  albersUsa.invert = function(coordinates) {
	    var k = lower48.scale(),
	        t = lower48.translate(),
	        x = (coordinates[0] - t[0]) / k,
	        y = (coordinates[1] - t[1]) / k;
	    return (y >= 0.120 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska
	        : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii
	        : lower48).invert(coordinates);
	  };

	  albersUsa.stream = function(stream) {
	    return cache && cacheStream === stream ? cache : cache = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream)]);
	  };

	  albersUsa.precision = function(_) {
	    if (!arguments.length) return lower48.precision();
	    lower48.precision(_), alaska.precision(_), hawaii.precision(_);
	    return reset();
	  };

	  albersUsa.scale = function(_) {
	    if (!arguments.length) return lower48.scale();
	    lower48.scale(_), alaska.scale(_ * 0.35), hawaii.scale(_);
	    return albersUsa.translate(lower48.translate());
	  };

	  albersUsa.translate = function(_) {
	    if (!arguments.length) return lower48.translate();
	    var k = lower48.scale(), x = +_[0], y = +_[1];

	    lower48Point = lower48
	        .translate(_)
	        .clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]])
	        .stream(pointStream);

	    alaskaPoint = alaska
	        .translate([x - 0.307 * k, y + 0.201 * k])
	        .clipExtent([[x - 0.425 * k + epsilon$2, y + 0.120 * k + epsilon$2], [x - 0.214 * k - epsilon$2, y + 0.234 * k - epsilon$2]])
	        .stream(pointStream);

	    hawaiiPoint = hawaii
	        .translate([x - 0.205 * k, y + 0.212 * k])
	        .clipExtent([[x - 0.214 * k + epsilon$2, y + 0.166 * k + epsilon$2], [x - 0.115 * k - epsilon$2, y + 0.234 * k - epsilon$2]])
	        .stream(pointStream);

	    return reset();
	  };

	  albersUsa.fitExtent = function(extent, object) {
	    return fitExtent(albersUsa, extent, object);
	  };

	  albersUsa.fitSize = function(size, object) {
	    return fitSize(albersUsa, size, object);
	  };

	  function reset() {
	    cache = cacheStream = null;
	    return albersUsa;
	  }

	  return albersUsa.scale(1070);
	};

	function azimuthalRaw(scale) {
	  return function(x, y) {
	    var cx = cos$1(x),
	        cy = cos$1(y),
	        k = scale(cx * cy);
	    return [
	      k * cy * sin$1(x),
	      k * sin$1(y)
	    ];
	  }
	}

	function azimuthalInvert(angle) {
	  return function(x, y) {
	    var z = sqrt(x * x + y * y),
	        c = angle(z),
	        sc = sin$1(c),
	        cc = cos$1(c);
	    return [
	      atan2(x * sc, z * cc),
	      asin(z && y * sc / z)
	    ];
	  }
	}

	var azimuthalEqualAreaRaw = azimuthalRaw(function(cxcy) {
	  return sqrt(2 / (1 + cxcy));
	});

	azimuthalEqualAreaRaw.invert = azimuthalInvert(function(z) {
	  return 2 * asin(z / 2);
	});

	var azimuthalEqualArea = function() {
	  return projection(azimuthalEqualAreaRaw)
	      .scale(124.75)
	      .clipAngle(180 - 1e-3);
	};

	var azimuthalEquidistantRaw = azimuthalRaw(function(c) {
	  return (c = acos(c)) && c / sin$1(c);
	});

	azimuthalEquidistantRaw.invert = azimuthalInvert(function(z) {
	  return z;
	});

	var azimuthalEquidistant = function() {
	  return projection(azimuthalEquidistantRaw)
	      .scale(79.4188)
	      .clipAngle(180 - 1e-3);
	};

	function mercatorRaw(lambda, phi) {
	  return [lambda, log(tan((halfPi$2 + phi) / 2))];
	}

	mercatorRaw.invert = function(x, y) {
	  return [x, 2 * atan(exp(y)) - halfPi$2];
	};

	var mercator = function() {
	  return mercatorProjection(mercatorRaw)
	      .scale(961 / tau$3);
	};

	function mercatorProjection(project) {
	  var m = projection(project),
	      center = m.center,
	      scale = m.scale,
	      translate = m.translate,
	      clipExtent = m.clipExtent,
	      x0 = null, y0, x1, y1; // clip extent

	  m.scale = function(_) {
	    return arguments.length ? (scale(_), reclip()) : scale();
	  };

	  m.translate = function(_) {
	    return arguments.length ? (translate(_), reclip()) : translate();
	  };

	  m.center = function(_) {
	    return arguments.length ? (center(_), reclip()) : center();
	  };

	  m.clipExtent = function(_) {
	    return arguments.length ? ((_ == null ? x0 = y0 = x1 = y1 = null : (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1])), reclip()) : x0 == null ? null : [[x0, y0], [x1, y1]];
	  };

	  function reclip() {
	    var k = pi$3 * scale(),
	        t = m(rotation(m.rotate()).invert([0, 0]));
	    return clipExtent(x0 == null
	        ? [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]] : project === mercatorRaw
	        ? [[Math.max(t[0] - k, x0), y0], [Math.min(t[0] + k, x1), y1]]
	        : [[x0, Math.max(t[1] - k, y0)], [x1, Math.min(t[1] + k, y1)]]);
	  }

	  return reclip();
	}

	function tany(y) {
	  return tan((halfPi$2 + y) / 2);
	}

	function conicConformalRaw(y0, y1) {
	  var cy0 = cos$1(y0),
	      n = y0 === y1 ? sin$1(y0) : log(cy0 / cos$1(y1)) / log(tany(y1) / tany(y0)),
	      f = cy0 * pow(tany(y0), n) / n;

	  if (!n) return mercatorRaw;

	  function project(x, y) {
	    if (f > 0) { if (y < -halfPi$2 + epsilon$2) y = -halfPi$2 + epsilon$2; }
	    else { if (y > halfPi$2 - epsilon$2) y = halfPi$2 - epsilon$2; }
	    var r = f / pow(tany(y), n);
	    return [r * sin$1(n * x), f - r * cos$1(n * x)];
	  }

	  project.invert = function(x, y) {
	    var fy = f - y, r = sign(n) * sqrt(x * x + fy * fy);
	    return [atan2(x, abs(fy)) / n * sign(fy), 2 * atan(pow(f / r, 1 / n)) - halfPi$2];
	  };

	  return project;
	}

	var conicConformal = function() {
	  return conicProjection(conicConformalRaw)
	      .scale(109.5)
	      .parallels([30, 30]);
	};

	function equirectangularRaw(lambda, phi) {
	  return [lambda, phi];
	}

	equirectangularRaw.invert = equirectangularRaw;

	var equirectangular = function() {
	  return projection(equirectangularRaw)
	      .scale(152.63);
	};

	function conicEquidistantRaw(y0, y1) {
	  var cy0 = cos$1(y0),
	      n = y0 === y1 ? sin$1(y0) : (cy0 - cos$1(y1)) / (y1 - y0),
	      g = cy0 / n + y0;

	  if (abs(n) < epsilon$2) return equirectangularRaw;

	  function project(x, y) {
	    var gy = g - y, nx = n * x;
	    return [gy * sin$1(nx), g - gy * cos$1(nx)];
	  }

	  project.invert = function(x, y) {
	    var gy = g - y;
	    return [atan2(x, abs(gy)) / n * sign(gy), g - sign(n) * sqrt(x * x + gy * gy)];
	  };

	  return project;
	}

	var conicEquidistant = function() {
	  return conicProjection(conicEquidistantRaw)
	      .scale(131.154)
	      .center([0, 13.9389]);
	};

	function gnomonicRaw(x, y) {
	  var cy = cos$1(y), k = cos$1(x) * cy;
	  return [cy * sin$1(x) / k, sin$1(y) / k];
	}

	gnomonicRaw.invert = azimuthalInvert(atan);

	var gnomonic = function() {
	  return projection(gnomonicRaw)
	      .scale(144.049)
	      .clipAngle(60);
	};

	function scaleTranslate(kx, ky, tx, ty) {
	  return kx === 1 && ky === 1 && tx === 0 && ty === 0 ? identity$4 : transformer({
	    point: function(x, y) {
	      this.stream.point(x * kx + tx, y * ky + ty);
	    }
	  });
	}

	var identity$5 = function() {
	  var k = 1, tx = 0, ty = 0, sx = 1, sy = 1, transform = identity$4, // scale, translate and reflect
	      x0 = null, y0, x1, y1, clip = identity$4, // clip extent
	      cache,
	      cacheStream,
	      projection;

	  function reset() {
	    cache = cacheStream = null;
	    return projection;
	  }

	  return projection = {
	    stream: function(stream) {
	      return cache && cacheStream === stream ? cache : cache = transform(clip(cacheStream = stream));
	    },
	    clipExtent: function(_) {
	      return arguments.length ? (clip = _ == null ? (x0 = y0 = x1 = y1 = null, identity$4) : clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
	    },
	    scale: function(_) {
	      return arguments.length ? (transform = scaleTranslate((k = +_) * sx, k * sy, tx, ty), reset()) : k;
	    },
	    translate: function(_) {
	      return arguments.length ? (transform = scaleTranslate(k * sx, k * sy, tx = +_[0], ty = +_[1]), reset()) : [tx, ty];
	    },
	    reflectX: function(_) {
	      return arguments.length ? (transform = scaleTranslate(k * (sx = _ ? -1 : 1), k * sy, tx, ty), reset()) : sx < 0;
	    },
	    reflectY: function(_) {
	      return arguments.length ? (transform = scaleTranslate(k * sx, k * (sy = _ ? -1 : 1), tx, ty), reset()) : sy < 0;
	    },
	    fitExtent: function(extent, object) {
	      return fitExtent(projection, extent, object);
	    },
	    fitSize: function(size, object) {
	      return fitSize(projection, size, object);
	    }
	  };
	};

	function orthographicRaw(x, y) {
	  return [cos$1(y) * sin$1(x), sin$1(y)];
	}

	orthographicRaw.invert = azimuthalInvert(asin);

	var orthographic = function() {
	  return projection(orthographicRaw)
	      .scale(249.5)
	      .clipAngle(90 + epsilon$2);
	};

	function stereographicRaw(x, y) {
	  var cy = cos$1(y), k = 1 + cos$1(x) * cy;
	  return [cy * sin$1(x) / k, sin$1(y) / k];
	}

	stereographicRaw.invert = azimuthalInvert(function(z) {
	  return 2 * atan(z);
	});

	var stereographic = function() {
	  return projection(stereographicRaw)
	      .scale(250)
	      .clipAngle(142);
	};

	function transverseMercatorRaw(lambda, phi) {
	  return [log(tan((halfPi$2 + phi) / 2)), -lambda];
	}

	transverseMercatorRaw.invert = function(x, y) {
	  return [-y, 2 * atan(exp(x)) - halfPi$2];
	};

	var transverseMercator = function() {
	  var m = mercatorProjection(transverseMercatorRaw),
	      center = m.center,
	      rotate = m.rotate;

	  m.center = function(_) {
	    return arguments.length ? center([-_[1], _[0]]) : (_ = center(), [_[1], -_[0]]);
	  };

	  m.rotate = function(_) {
	    return arguments.length ? rotate([_[0], _[1], _.length > 2 ? _[2] + 90 : 90]) : (_ = rotate(), [_[0], _[1], _[2] - 90]);
	  };

	  return rotate([0, 0, 90])
	      .scale(159.155);
	};

	function defaultSeparation(a, b) {
	  return a.parent === b.parent ? 1 : 2;
	}

	function meanX(children) {
	  return children.reduce(meanXReduce, 0) / children.length;
	}

	function meanXReduce(x, c) {
	  return x + c.x;
	}

	function maxY(children) {
	  return 1 + children.reduce(maxYReduce, 0);
	}

	function maxYReduce(y, c) {
	  return Math.max(y, c.y);
	}

	function leafLeft(node) {
	  var children;
	  while (children = node.children) node = children[0];
	  return node;
	}

	function leafRight(node) {
	  var children;
	  while (children = node.children) node = children[children.length - 1];
	  return node;
	}

	var cluster = function() {
	  var separation = defaultSeparation,
	      dx = 1,
	      dy = 1,
	      nodeSize = false;

	  function cluster(root) {
	    var previousNode,
	        x = 0;

	    // First walk, computing the initial x & y values.
	    root.eachAfter(function(node) {
	      var children = node.children;
	      if (children) {
	        node.x = meanX(children);
	        node.y = maxY(children);
	      } else {
	        node.x = previousNode ? x += separation(node, previousNode) : 0;
	        node.y = 0;
	        previousNode = node;
	      }
	    });

	    var left = leafLeft(root),
	        right = leafRight(root),
	        x0 = left.x - separation(left, right) / 2,
	        x1 = right.x + separation(right, left) / 2;

	    // Second walk, normalizing x & y to the desired size.
	    return root.eachAfter(nodeSize ? function(node) {
	      node.x = (node.x - root.x) * dx;
	      node.y = (root.y - node.y) * dy;
	    } : function(node) {
	      node.x = (node.x - x0) / (x1 - x0) * dx;
	      node.y = (1 - (root.y ? node.y / root.y : 1)) * dy;
	    });
	  }

	  cluster.separation = function(x) {
	    return arguments.length ? (separation = x, cluster) : separation;
	  };

	  cluster.size = function(x) {
	    return arguments.length ? (nodeSize = false, dx = +x[0], dy = +x[1], cluster) : (nodeSize ? null : [dx, dy]);
	  };

	  cluster.nodeSize = function(x) {
	    return arguments.length ? (nodeSize = true, dx = +x[0], dy = +x[1], cluster) : (nodeSize ? [dx, dy] : null);
	  };

	  return cluster;
	};

	function count(node) {
	  var sum = 0,
	      children = node.children,
	      i = children && children.length;
	  if (!i) sum = 1;
	  else while (--i >= 0) sum += children[i].value;
	  node.value = sum;
	}

	var node_count = function() {
	  return this.eachAfter(count);
	};

	var node_each = function(callback) {
	  var node = this, current, next = [node], children, i, n;
	  do {
	    current = next.reverse(), next = [];
	    while (node = current.pop()) {
	      callback(node), children = node.children;
	      if (children) for (i = 0, n = children.length; i < n; ++i) {
	        next.push(children[i]);
	      }
	    }
	  } while (next.length);
	  return this;
	};

	var node_eachBefore = function(callback) {
	  var node = this, nodes = [node], children, i;
	  while (node = nodes.pop()) {
	    callback(node), children = node.children;
	    if (children) for (i = children.length - 1; i >= 0; --i) {
	      nodes.push(children[i]);
	    }
	  }
	  return this;
	};

	var node_eachAfter = function(callback) {
	  var node = this, nodes = [node], next = [], children, i, n;
	  while (node = nodes.pop()) {
	    next.push(node), children = node.children;
	    if (children) for (i = 0, n = children.length; i < n; ++i) {
	      nodes.push(children[i]);
	    }
	  }
	  while (node = next.pop()) {
	    callback(node);
	  }
	  return this;
	};

	var node_sum = function(value) {
	  return this.eachAfter(function(node) {
	    var sum = +value(node.data) || 0,
	        children = node.children,
	        i = children && children.length;
	    while (--i >= 0) sum += children[i].value;
	    node.value = sum;
	  });
	};

	var node_sort = function(compare) {
	  return this.eachBefore(function(node) {
	    if (node.children) {
	      node.children.sort(compare);
	    }
	  });
	};

	var node_path = function(end) {
	  var start = this,
	      ancestor = leastCommonAncestor(start, end),
	      nodes = [start];
	  while (start !== ancestor) {
	    start = start.parent;
	    nodes.push(start);
	  }
	  var k = nodes.length;
	  while (end !== ancestor) {
	    nodes.splice(k, 0, end);
	    end = end.parent;
	  }
	  return nodes;
	};

	function leastCommonAncestor(a, b) {
	  if (a === b) return a;
	  var aNodes = a.ancestors(),
	      bNodes = b.ancestors(),
	      c = null;
	  a = aNodes.pop();
	  b = bNodes.pop();
	  while (a === b) {
	    c = a;
	    a = aNodes.pop();
	    b = bNodes.pop();
	  }
	  return c;
	}

	var node_ancestors = function() {
	  var node = this, nodes = [node];
	  while (node = node.parent) {
	    nodes.push(node);
	  }
	  return nodes;
	};

	var node_descendants = function() {
	  var nodes = [];
	  this.each(function(node) {
	    nodes.push(node);
	  });
	  return nodes;
	};

	var node_leaves = function() {
	  var leaves = [];
	  this.eachBefore(function(node) {
	    if (!node.children) {
	      leaves.push(node);
	    }
	  });
	  return leaves;
	};

	var node_links = function() {
	  var root = this, links = [];
	  root.each(function(node) {
	    if (node !== root) { // Don’t include the root’s parent, if any.
	      links.push({source: node.parent, target: node});
	    }
	  });
	  return links;
	};

	function hierarchy(data, children) {
	  var root = new Node(data),
	      valued = +data.value && (root.value = data.value),
	      node,
	      nodes = [root],
	      child,
	      childs,
	      i,
	      n;

	  if (children == null) children = defaultChildren;

	  while (node = nodes.pop()) {
	    if (valued) node.value = +node.data.value;
	    if ((childs = children(node.data)) && (n = childs.length)) {
	      node.children = new Array(n);
	      for (i = n - 1; i >= 0; --i) {
	        nodes.push(child = node.children[i] = new Node(childs[i]));
	        child.parent = node;
	        child.depth = node.depth + 1;
	      }
	    }
	  }

	  return root.eachBefore(computeHeight);
	}

	function node_copy() {
	  return hierarchy(this).eachBefore(copyData);
	}

	function defaultChildren(d) {
	  return d.children;
	}

	function copyData(node) {
	  node.data = node.data.data;
	}

	function computeHeight(node) {
	  var height = 0;
	  do node.height = height;
	  while ((node = node.parent) && (node.height < ++height));
	}

	function Node(data) {
	  this.data = data;
	  this.depth =
	  this.height = 0;
	  this.parent = null;
	}

	Node.prototype = hierarchy.prototype = {
	  constructor: Node,
	  count: node_count,
	  each: node_each,
	  eachAfter: node_eachAfter,
	  eachBefore: node_eachBefore,
	  sum: node_sum,
	  sort: node_sort,
	  path: node_path,
	  ancestors: node_ancestors,
	  descendants: node_descendants,
	  leaves: node_leaves,
	  links: node_links,
	  copy: node_copy
	};

	function Node$2(value) {
	  this._ = value;
	  this.next = null;
	}

	var shuffle$1 = function(array) {
	  var i,
	      n = (array = array.slice()).length,
	      head = null,
	      node = head;

	  while (n) {
	    var next = new Node$2(array[n - 1]);
	    if (node) node = node.next = next;
	    else node = head = next;
	    array[i] = array[--n];
	  }

	  return {
	    head: head,
	    tail: node
	  };
	};

	var enclose = function(circles) {
	  return encloseN(shuffle$1(circles), []);
	};

	function encloses(a, b) {
	  var dx = b.x - a.x,
	      dy = b.y - a.y,
	      dr = a.r - b.r;
	  return dr * dr + 1e-6 > dx * dx + dy * dy;
	}

	// Returns the smallest circle that contains circles L and intersects circles B.
	function encloseN(L, B) {
	  var circle,
	      l0 = null,
	      l1 = L.head,
	      l2,
	      p1;

	  switch (B.length) {
	    case 1: circle = enclose1(B[0]); break;
	    case 2: circle = enclose2(B[0], B[1]); break;
	    case 3: circle = enclose3(B[0], B[1], B[2]); break;
	  }

	  while (l1) {
	    p1 = l1._, l2 = l1.next;
	    if (!circle || !encloses(circle, p1)) {

	      // Temporarily truncate L before l1.
	      if (l0) L.tail = l0, l0.next = null;
	      else L.head = L.tail = null;

	      B.push(p1);
	      circle = encloseN(L, B); // Note: reorders L!
	      B.pop();

	      // Move l1 to the front of L and reconnect the truncated list L.
	      if (L.head) l1.next = L.head, L.head = l1;
	      else l1.next = null, L.head = L.tail = l1;
	      l0 = L.tail, l0.next = l2;

	    } else {
	      l0 = l1;
	    }
	    l1 = l2;
	  }

	  L.tail = l0;
	  return circle;
	}

	function enclose1(a) {
	  return {
	    x: a.x,
	    y: a.y,
	    r: a.r
	  };
	}

	function enclose2(a, b) {
	  var x1 = a.x, y1 = a.y, r1 = a.r,
	      x2 = b.x, y2 = b.y, r2 = b.r,
	      x21 = x2 - x1, y21 = y2 - y1, r21 = r2 - r1,
	      l = Math.sqrt(x21 * x21 + y21 * y21);
	  return {
	    x: (x1 + x2 + x21 / l * r21) / 2,
	    y: (y1 + y2 + y21 / l * r21) / 2,
	    r: (l + r1 + r2) / 2
	  };
	}

	function enclose3(a, b, c) {
	  var x1 = a.x, y1 = a.y, r1 = a.r,
	      x2 = b.x, y2 = b.y, r2 = b.r,
	      x3 = c.x, y3 = c.y, r3 = c.r,
	      a2 = 2 * (x1 - x2),
	      b2 = 2 * (y1 - y2),
	      c2 = 2 * (r2 - r1),
	      d2 = x1 * x1 + y1 * y1 - r1 * r1 - x2 * x2 - y2 * y2 + r2 * r2,
	      a3 = 2 * (x1 - x3),
	      b3 = 2 * (y1 - y3),
	      c3 = 2 * (r3 - r1),
	      d3 = x1 * x1 + y1 * y1 - r1 * r1 - x3 * x3 - y3 * y3 + r3 * r3,
	      ab = a3 * b2 - a2 * b3,
	      xa = (b2 * d3 - b3 * d2) / ab - x1,
	      xb = (b3 * c2 - b2 * c3) / ab,
	      ya = (a3 * d2 - a2 * d3) / ab - y1,
	      yb = (a2 * c3 - a3 * c2) / ab,
	      A = xb * xb + yb * yb - 1,
	      B = 2 * (xa * xb + ya * yb + r1),
	      C = xa * xa + ya * ya - r1 * r1,
	      r = (-B - Math.sqrt(B * B - 4 * A * C)) / (2 * A);
	  return {
	    x: xa + xb * r + x1,
	    y: ya + yb * r + y1,
	    r: r
	  };
	}

	function place(a, b, c) {
	  var ax = a.x,
	      ay = a.y,
	      da = b.r + c.r,
	      db = a.r + c.r,
	      dx = b.x - ax,
	      dy = b.y - ay,
	      dc = dx * dx + dy * dy;
	  if (dc) {
	    var x = 0.5 + ((db *= db) - (da *= da)) / (2 * dc),
	        y = Math.sqrt(Math.max(0, 2 * da * (db + dc) - (db -= dc) * db - da * da)) / (2 * dc);
	    c.x = ax + x * dx + y * dy;
	    c.y = ay + x * dy - y * dx;
	  } else {
	    c.x = ax + db;
	    c.y = ay;
	  }
	}

	function intersects(a, b) {
	  var dx = b.x - a.x,
	      dy = b.y - a.y,
	      dr = a.r + b.r;
	  return dr * dr - 1e-6 > dx * dx + dy * dy;
	}

	function distance2(node, x, y) {
	  var a = node._,
	      b = node.next._,
	      ab = a.r + b.r,
	      dx = (a.x * b.r + b.x * a.r) / ab - x,
	      dy = (a.y * b.r + b.y * a.r) / ab - y;
	  return dx * dx + dy * dy;
	}

	function Node$1(circle) {
	  this._ = circle;
	  this.next = null;
	  this.previous = null;
	}

	function packEnclose(circles) {
	  if (!(n = circles.length)) return 0;

	  var a, b, c, n;

	  // Place the first circle.
	  a = circles[0], a.x = 0, a.y = 0;
	  if (!(n > 1)) return a.r;

	  // Place the second circle.
	  b = circles[1], a.x = -b.r, b.x = a.r, b.y = 0;
	  if (!(n > 2)) return a.r + b.r;

	  // Place the third circle.
	  place(b, a, c = circles[2]);

	  // Initialize the weighted centroid.
	  var aa = a.r * a.r,
	      ba = b.r * b.r,
	      ca = c.r * c.r,
	      oa = aa + ba + ca,
	      ox = aa * a.x + ba * b.x + ca * c.x,
	      oy = aa * a.y + ba * b.y + ca * c.y,
	      cx, cy, i, j, k, sj, sk;

	  // Initialize the front-chain using the first three circles a, b and c.
	  a = new Node$1(a), b = new Node$1(b), c = new Node$1(c);
	  a.next = c.previous = b;
	  b.next = a.previous = c;
	  c.next = b.previous = a;

	  // Attempt to place each remaining circle…
	  pack: for (i = 3; i < n; ++i) {
	    place(a._, b._, c = circles[i]), c = new Node$1(c);

	    // Find the closest intersecting circle on the front-chain, if any.
	    // “Closeness” is determined by linear distance along the front-chain.
	    // “Ahead” or “behind” is likewise determined by linear distance.
	    j = b.next, k = a.previous, sj = b._.r, sk = a._.r;
	    do {
	      if (sj <= sk) {
	        if (intersects(j._, c._)) {
	          b = j, a.next = b, b.previous = a, --i;
	          continue pack;
	        }
	        sj += j._.r, j = j.next;
	      } else {
	        if (intersects(k._, c._)) {
	          a = k, a.next = b, b.previous = a, --i;
	          continue pack;
	        }
	        sk += k._.r, k = k.previous;
	      }
	    } while (j !== k.next);

	    // Success! Insert the new circle c between a and b.
	    c.previous = a, c.next = b, a.next = b.previous = b = c;

	    // Update the weighted centroid.
	    oa += ca = c._.r * c._.r;
	    ox += ca * c._.x;
	    oy += ca * c._.y;

	    // Compute the new closest circle pair to the centroid.
	    aa = distance2(a, cx = ox / oa, cy = oy / oa);
	    while ((c = c.next) !== b) {
	      if ((ca = distance2(c, cx, cy)) < aa) {
	        a = c, aa = ca;
	      }
	    }
	    b = a.next;
	  }

	  // Compute the enclosing circle of the front chain.
	  a = [b._], c = b; while ((c = c.next) !== b) a.push(c._); c = enclose(a);

	  // Translate the circles to put the enclosing circle around the origin.
	  for (i = 0; i < n; ++i) a = circles[i], a.x -= c.x, a.y -= c.y;

	  return c.r;
	}

	var siblings = function(circles) {
	  packEnclose(circles);
	  return circles;
	};

	function optional(f) {
	  return f == null ? null : required(f);
	}

	function required(f) {
	  if (typeof f !== "function") throw new Error;
	  return f;
	}

	function constantZero() {
	  return 0;
	}

	var constant$8 = function(x) {
	  return function() {
	    return x;
	  };
	};

	function defaultRadius$1(d) {
	  return Math.sqrt(d.value);
	}

	var index$2 = function() {
	  var radius = null,
	      dx = 1,
	      dy = 1,
	      padding = constantZero;

	  function pack(root) {
	    root.x = dx / 2, root.y = dy / 2;
	    if (radius) {
	      root.eachBefore(radiusLeaf(radius))
	          .eachAfter(packChildren(padding, 0.5))
	          .eachBefore(translateChild(1));
	    } else {
	      root.eachBefore(radiusLeaf(defaultRadius$1))
	          .eachAfter(packChildren(constantZero, 1))
	          .eachAfter(packChildren(padding, root.r / Math.min(dx, dy)))
	          .eachBefore(translateChild(Math.min(dx, dy) / (2 * root.r)));
	    }
	    return root;
	  }

	  pack.radius = function(x) {
	    return arguments.length ? (radius = optional(x), pack) : radius;
	  };

	  pack.size = function(x) {
	    return arguments.length ? (dx = +x[0], dy = +x[1], pack) : [dx, dy];
	  };

	  pack.padding = function(x) {
	    return arguments.length ? (padding = typeof x === "function" ? x : constant$8(+x), pack) : padding;
	  };

	  return pack;
	};

	function radiusLeaf(radius) {
	  return function(node) {
	    if (!node.children) {
	      node.r = Math.max(0, +radius(node) || 0);
	    }
	  };
	}

	function packChildren(padding, k) {
	  return function(node) {
	    if (children = node.children) {
	      var children,
	          i,
	          n = children.length,
	          r = padding(node) * k || 0,
	          e;

	      if (r) for (i = 0; i < n; ++i) children[i].r += r;
	      e = packEnclose(children);
	      if (r) for (i = 0; i < n; ++i) children[i].r -= r;
	      node.r = e + r;
	    }
	  };
	}

	function translateChild(k) {
	  return function(node) {
	    var parent = node.parent;
	    node.r *= k;
	    if (parent) {
	      node.x = parent.x + k * node.x;
	      node.y = parent.y + k * node.y;
	    }
	  };
	}

	var roundNode = function(node) {
	  node.x0 = Math.round(node.x0);
	  node.y0 = Math.round(node.y0);
	  node.x1 = Math.round(node.x1);
	  node.y1 = Math.round(node.y1);
	};

	var treemapDice = function(parent, x0, y0, x1, y1) {
	  var nodes = parent.children,
	      node,
	      i = -1,
	      n = nodes.length,
	      k = parent.value && (x1 - x0) / parent.value;

	  while (++i < n) {
	    node = nodes[i], node.y0 = y0, node.y1 = y1;
	    node.x0 = x0, node.x1 = x0 += node.value * k;
	  }
	};

	var partition = function() {
	  var dx = 1,
	      dy = 1,
	      padding = 0,
	      round = false;

	  function partition(root) {
	    var n = root.height + 1;
	    root.x0 =
	    root.y0 = padding;
	    root.x1 = dx;
	    root.y1 = dy / n;
	    root.eachBefore(positionNode(dy, n));
	    if (round) root.eachBefore(roundNode);
	    return root;
	  }

	  function positionNode(dy, n) {
	    return function(node) {
	      if (node.children) {
	        treemapDice(node, node.x0, dy * (node.depth + 1) / n, node.x1, dy * (node.depth + 2) / n);
	      }
	      var x0 = node.x0,
	          y0 = node.y0,
	          x1 = node.x1 - padding,
	          y1 = node.y1 - padding;
	      if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
	      if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
	      node.x0 = x0;
	      node.y0 = y0;
	      node.x1 = x1;
	      node.y1 = y1;
	    };
	  }

	  partition.round = function(x) {
	    return arguments.length ? (round = !!x, partition) : round;
	  };

	  partition.size = function(x) {
	    return arguments.length ? (dx = +x[0], dy = +x[1], partition) : [dx, dy];
	  };

	  partition.padding = function(x) {
	    return arguments.length ? (padding = +x, partition) : padding;
	  };

	  return partition;
	};

	var keyPrefix$1 = "$";
	var preroot = {depth: -1};
	var ambiguous = {};

	function defaultId(d) {
	  return d.id;
	}

	function defaultParentId(d) {
	  return d.parentId;
	}

	var stratify = function() {
	  var id = defaultId,
	      parentId = defaultParentId;

	  function stratify(data) {
	    var d,
	        i,
	        n = data.length,
	        root,
	        parent,
	        node,
	        nodes = new Array(n),
	        nodeId,
	        nodeKey,
	        nodeByKey = {};

	    for (i = 0; i < n; ++i) {
	      d = data[i], node = nodes[i] = new Node(d);
	      if ((nodeId = id(d, i, data)) != null && (nodeId += "")) {
	        nodeKey = keyPrefix$1 + (node.id = nodeId);
	        nodeByKey[nodeKey] = nodeKey in nodeByKey ? ambiguous : node;
	      }
	    }

	    for (i = 0; i < n; ++i) {
	      node = nodes[i], nodeId = parentId(data[i], i, data);
	      if (nodeId == null || !(nodeId += "")) {
	        if (root) throw new Error("multiple roots");
	        root = node;
	      } else {
	        parent = nodeByKey[keyPrefix$1 + nodeId];
	        if (!parent) throw new Error("missing: " + nodeId);
	        if (parent === ambiguous) throw new Error("ambiguous: " + nodeId);
	        if (parent.children) parent.children.push(node);
	        else parent.children = [node];
	        node.parent = parent;
	      }
	    }

	    if (!root) throw new Error("no root");
	    root.parent = preroot;
	    root.eachBefore(function(node) { node.depth = node.parent.depth + 1; --n; }).eachBefore(computeHeight);
	    root.parent = null;
	    if (n > 0) throw new Error("cycle");

	    return root;
	  }

	  stratify.id = function(x) {
	    return arguments.length ? (id = required(x), stratify) : id;
	  };

	  stratify.parentId = function(x) {
	    return arguments.length ? (parentId = required(x), stratify) : parentId;
	  };

	  return stratify;
	};

	function defaultSeparation$1(a, b) {
	  return a.parent === b.parent ? 1 : 2;
	}

	// function radialSeparation(a, b) {
	//   return (a.parent === b.parent ? 1 : 2) / a.depth;
	// }

	// This function is used to traverse the left contour of a subtree (or
	// subforest). It returns the successor of v on this contour. This successor is
	// either given by the leftmost child of v or by the thread of v. The function
	// returns null if and only if v is on the highest level of its subtree.
	function nextLeft(v) {
	  var children = v.children;
	  return children ? children[0] : v.t;
	}

	// This function works analogously to nextLeft.
	function nextRight(v) {
	  var children = v.children;
	  return children ? children[children.length - 1] : v.t;
	}

	// Shifts the current subtree rooted at w+. This is done by increasing
	// prelim(w+) and mod(w+) by shift.
	function moveSubtree(wm, wp, shift) {
	  var change = shift / (wp.i - wm.i);
	  wp.c -= change;
	  wp.s += shift;
	  wm.c += change;
	  wp.z += shift;
	  wp.m += shift;
	}

	// All other shifts, applied to the smaller subtrees between w- and w+, are
	// performed by this function. To prepare the shifts, we have to adjust
	// change(w+), shift(w+), and change(w-).
	function executeShifts(v) {
	  var shift = 0,
	      change = 0,
	      children = v.children,
	      i = children.length,
	      w;
	  while (--i >= 0) {
	    w = children[i];
	    w.z += shift;
	    w.m += shift;
	    shift += w.s + (change += w.c);
	  }
	}

	// If vi-’s ancestor is a sibling of v, returns vi-’s ancestor. Otherwise,
	// returns the specified (default) ancestor.
	function nextAncestor(vim, v, ancestor) {
	  return vim.a.parent === v.parent ? vim.a : ancestor;
	}

	function TreeNode(node, i) {
	  this._ = node;
	  this.parent = null;
	  this.children = null;
	  this.A = null; // default ancestor
	  this.a = this; // ancestor
	  this.z = 0; // prelim
	  this.m = 0; // mod
	  this.c = 0; // change
	  this.s = 0; // shift
	  this.t = null; // thread
	  this.i = i; // number
	}

	TreeNode.prototype = Object.create(Node.prototype);

	function treeRoot(root) {
	  var tree = new TreeNode(root, 0),
	      node,
	      nodes = [tree],
	      child,
	      children,
	      i,
	      n;

	  while (node = nodes.pop()) {
	    if (children = node._.children) {
	      node.children = new Array(n = children.length);
	      for (i = n - 1; i >= 0; --i) {
	        nodes.push(child = node.children[i] = new TreeNode(children[i], i));
	        child.parent = node;
	      }
	    }
	  }

	  (tree.parent = new TreeNode(null, 0)).children = [tree];
	  return tree;
	}

	// Node-link tree diagram using the Reingold-Tilford "tidy" algorithm
	var tree = function() {
	  var separation = defaultSeparation$1,
	      dx = 1,
	      dy = 1,
	      nodeSize = null;

	  function tree(root) {
	    var t = treeRoot(root);

	    // Compute the layout using Buchheim et al.’s algorithm.
	    t.eachAfter(firstWalk), t.parent.m = -t.z;
	    t.eachBefore(secondWalk);

	    // If a fixed node size is specified, scale x and y.
	    if (nodeSize) root.eachBefore(sizeNode);

	    // If a fixed tree size is specified, scale x and y based on the extent.
	    // Compute the left-most, right-most, and depth-most nodes for extents.
	    else {
	      var left = root,
	          right = root,
	          bottom = root;
	      root.eachBefore(function(node) {
	        if (node.x < left.x) left = node;
	        if (node.x > right.x) right = node;
	        if (node.depth > bottom.depth) bottom = node;
	      });
	      var s = left === right ? 1 : separation(left, right) / 2,
	          tx = s - left.x,
	          kx = dx / (right.x + s + tx),
	          ky = dy / (bottom.depth || 1);
	      root.eachBefore(function(node) {
	        node.x = (node.x + tx) * kx;
	        node.y = node.depth * ky;
	      });
	    }

	    return root;
	  }

	  // Computes a preliminary x-coordinate for v. Before that, FIRST WALK is
	  // applied recursively to the children of v, as well as the function
	  // APPORTION. After spacing out the children by calling EXECUTE SHIFTS, the
	  // node v is placed to the midpoint of its outermost children.
	  function firstWalk(v) {
	    var children = v.children,
	        siblings = v.parent.children,
	        w = v.i ? siblings[v.i - 1] : null;
	    if (children) {
	      executeShifts(v);
	      var midpoint = (children[0].z + children[children.length - 1].z) / 2;
	      if (w) {
	        v.z = w.z + separation(v._, w._);
	        v.m = v.z - midpoint;
	      } else {
	        v.z = midpoint;
	      }
	    } else if (w) {
	      v.z = w.z + separation(v._, w._);
	    }
	    v.parent.A = apportion(v, w, v.parent.A || siblings[0]);
	  }

	  // Computes all real x-coordinates by summing up the modifiers recursively.
	  function secondWalk(v) {
	    v._.x = v.z + v.parent.m;
	    v.m += v.parent.m;
	  }

	  // The core of the algorithm. Here, a new subtree is combined with the
	  // previous subtrees. Threads are used to traverse the inside and outside
	  // contours of the left and right subtree up to the highest common level. The
	  // vertices used for the traversals are vi+, vi-, vo-, and vo+, where the
	  // superscript o means outside and i means inside, the subscript - means left
	  // subtree and + means right subtree. For summing up the modifiers along the
	  // contour, we use respective variables si+, si-, so-, and so+. Whenever two
	  // nodes of the inside contours conflict, we compute the left one of the
	  // greatest uncommon ancestors using the function ANCESTOR and call MOVE
	  // SUBTREE to shift the subtree and prepare the shifts of smaller subtrees.
	  // Finally, we add a new thread (if necessary).
	  function apportion(v, w, ancestor) {
	    if (w) {
	      var vip = v,
	          vop = v,
	          vim = w,
	          vom = vip.parent.children[0],
	          sip = vip.m,
	          sop = vop.m,
	          sim = vim.m,
	          som = vom.m,
	          shift;
	      while (vim = nextRight(vim), vip = nextLeft(vip), vim && vip) {
	        vom = nextLeft(vom);
	        vop = nextRight(vop);
	        vop.a = v;
	        shift = vim.z + sim - vip.z - sip + separation(vim._, vip._);
	        if (shift > 0) {
	          moveSubtree(nextAncestor(vim, v, ancestor), v, shift);
	          sip += shift;
	          sop += shift;
	        }
	        sim += vim.m;
	        sip += vip.m;
	        som += vom.m;
	        sop += vop.m;
	      }
	      if (vim && !nextRight(vop)) {
	        vop.t = vim;
	        vop.m += sim - sop;
	      }
	      if (vip && !nextLeft(vom)) {
	        vom.t = vip;
	        vom.m += sip - som;
	        ancestor = v;
	      }
	    }
	    return ancestor;
	  }

	  function sizeNode(node) {
	    node.x *= dx;
	    node.y = node.depth * dy;
	  }

	  tree.separation = function(x) {
	    return arguments.length ? (separation = x, tree) : separation;
	  };

	  tree.size = function(x) {
	    return arguments.length ? (nodeSize = false, dx = +x[0], dy = +x[1], tree) : (nodeSize ? null : [dx, dy]);
	  };

	  tree.nodeSize = function(x) {
	    return arguments.length ? (nodeSize = true, dx = +x[0], dy = +x[1], tree) : (nodeSize ? [dx, dy] : null);
	  };

	  return tree;
	};

	var treemapSlice = function(parent, x0, y0, x1, y1) {
	  var nodes = parent.children,
	      node,
	      i = -1,
	      n = nodes.length,
	      k = parent.value && (y1 - y0) / parent.value;

	  while (++i < n) {
	    node = nodes[i], node.x0 = x0, node.x1 = x1;
	    node.y0 = y0, node.y1 = y0 += node.value * k;
	  }
	};

	var phi = (1 + Math.sqrt(5)) / 2;

	function squarifyRatio(ratio, parent, x0, y0, x1, y1) {
	  var rows = [],
	      nodes = parent.children,
	      row,
	      nodeValue,
	      i0 = 0,
	      i1 = 0,
	      n = nodes.length,
	      dx, dy,
	      value = parent.value,
	      sumValue,
	      minValue,
	      maxValue,
	      newRatio,
	      minRatio,
	      alpha,
	      beta;

	  while (i0 < n) {
	    dx = x1 - x0, dy = y1 - y0;

	    // Find the next non-empty node.
	    do sumValue = nodes[i1++].value; while (!sumValue && i1 < n);
	    minValue = maxValue = sumValue;
	    alpha = Math.max(dy / dx, dx / dy) / (value * ratio);
	    beta = sumValue * sumValue * alpha;
	    minRatio = Math.max(maxValue / beta, beta / minValue);

	    // Keep adding nodes while the aspect ratio maintains or improves.
	    for (; i1 < n; ++i1) {
	      sumValue += nodeValue = nodes[i1].value;
	      if (nodeValue < minValue) minValue = nodeValue;
	      if (nodeValue > maxValue) maxValue = nodeValue;
	      beta = sumValue * sumValue * alpha;
	      newRatio = Math.max(maxValue / beta, beta / minValue);
	      if (newRatio > minRatio) { sumValue -= nodeValue; break; }
	      minRatio = newRatio;
	    }

	    // Position and record the row orientation.
	    rows.push(row = {value: sumValue, dice: dx < dy, children: nodes.slice(i0, i1)});
	    if (row.dice) treemapDice(row, x0, y0, x1, value ? y0 += dy * sumValue / value : y1);
	    else treemapSlice(row, x0, y0, value ? x0 += dx * sumValue / value : x1, y1);
	    value -= sumValue, i0 = i1;
	  }

	  return rows;
	}

	var squarify = ((function custom(ratio) {

	  function squarify(parent, x0, y0, x1, y1) {
	    squarifyRatio(ratio, parent, x0, y0, x1, y1);
	  }

	  squarify.ratio = function(x) {
	    return custom((x = +x) > 1 ? x : 1);
	  };

	  return squarify;
	}))(phi);

	var index$3 = function() {
	  var tile = squarify,
	      round = false,
	      dx = 1,
	      dy = 1,
	      paddingStack = [0],
	      paddingInner = constantZero,
	      paddingTop = constantZero,
	      paddingRight = constantZero,
	      paddingBottom = constantZero,
	      paddingLeft = constantZero;

	  function treemap(root) {
	    root.x0 =
	    root.y0 = 0;
	    root.x1 = dx;
	    root.y1 = dy;
	    root.eachBefore(positionNode);
	    paddingStack = [0];
	    if (round) root.eachBefore(roundNode);
	    return root;
	  }

	  function positionNode(node) {
	    var p = paddingStack[node.depth],
	        x0 = node.x0 + p,
	        y0 = node.y0 + p,
	        x1 = node.x1 - p,
	        y1 = node.y1 - p;
	    if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
	    if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
	    node.x0 = x0;
	    node.y0 = y0;
	    node.x1 = x1;
	    node.y1 = y1;
	    if (node.children) {
	      p = paddingStack[node.depth + 1] = paddingInner(node) / 2;
	      x0 += paddingLeft(node) - p;
	      y0 += paddingTop(node) - p;
	      x1 -= paddingRight(node) - p;
	      y1 -= paddingBottom(node) - p;
	      if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
	      if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
	      tile(node, x0, y0, x1, y1);
	    }
	  }

	  treemap.round = function(x) {
	    return arguments.length ? (round = !!x, treemap) : round;
	  };

	  treemap.size = function(x) {
	    return arguments.length ? (dx = +x[0], dy = +x[1], treemap) : [dx, dy];
	  };

	  treemap.tile = function(x) {
	    return arguments.length ? (tile = required(x), treemap) : tile;
	  };

	  treemap.padding = function(x) {
	    return arguments.length ? treemap.paddingInner(x).paddingOuter(x) : treemap.paddingInner();
	  };

	  treemap.paddingInner = function(x) {
	    return arguments.length ? (paddingInner = typeof x === "function" ? x : constant$8(+x), treemap) : paddingInner;
	  };

	  treemap.paddingOuter = function(x) {
	    return arguments.length ? treemap.paddingTop(x).paddingRight(x).paddingBottom(x).paddingLeft(x) : treemap.paddingTop();
	  };

	  treemap.paddingTop = function(x) {
	    return arguments.length ? (paddingTop = typeof x === "function" ? x : constant$8(+x), treemap) : paddingTop;
	  };

	  treemap.paddingRight = function(x) {
	    return arguments.length ? (paddingRight = typeof x === "function" ? x : constant$8(+x), treemap) : paddingRight;
	  };

	  treemap.paddingBottom = function(x) {
	    return arguments.length ? (paddingBottom = typeof x === "function" ? x : constant$8(+x), treemap) : paddingBottom;
	  };

	  treemap.paddingLeft = function(x) {
	    return arguments.length ? (paddingLeft = typeof x === "function" ? x : constant$8(+x), treemap) : paddingLeft;
	  };

	  return treemap;
	};

	var binary = function(parent, x0, y0, x1, y1) {
	  var nodes = parent.children,
	      i, n = nodes.length,
	      sum, sums = new Array(n + 1);

	  for (sums[0] = sum = i = 0; i < n; ++i) {
	    sums[i + 1] = sum += nodes[i].value;
	  }

	  partition(0, n, parent.value, x0, y0, x1, y1);

	  function partition(i, j, value, x0, y0, x1, y1) {
	    if (i >= j - 1) {
	      var node = nodes[i];
	      node.x0 = x0, node.y0 = y0;
	      node.x1 = x1, node.y1 = y1;
	      return;
	    }

	    var valueOffset = sums[i],
	        valueTarget = (value / 2) + valueOffset,
	        k = i + 1,
	        hi = j - 1;

	    while (k < hi) {
	      var mid = k + hi >>> 1;
	      if (sums[mid] < valueTarget) k = mid + 1;
	      else hi = mid;
	    }

	    if ((valueTarget - sums[k - 1]) < (sums[k] - valueTarget) && i + 1 < k) --k;

	    var valueLeft = sums[k] - valueOffset,
	        valueRight = value - valueLeft;

	    if ((x1 - x0) > (y1 - y0)) {
	      var xk = (x0 * valueRight + x1 * valueLeft) / value;
	      partition(i, k, valueLeft, x0, y0, xk, y1);
	      partition(k, j, valueRight, xk, y0, x1, y1);
	    } else {
	      var yk = (y0 * valueRight + y1 * valueLeft) / value;
	      partition(i, k, valueLeft, x0, y0, x1, yk);
	      partition(k, j, valueRight, x0, yk, x1, y1);
	    }
	  }
	};

	var sliceDice = function(parent, x0, y0, x1, y1) {
	  (parent.depth & 1 ? treemapSlice : treemapDice)(parent, x0, y0, x1, y1);
	};

	var resquarify = ((function custom(ratio) {

	  function resquarify(parent, x0, y0, x1, y1) {
	    if ((rows = parent._squarify) && (rows.ratio === ratio)) {
	      var rows,
	          row,
	          nodes,
	          i,
	          j = -1,
	          n,
	          m = rows.length,
	          value = parent.value;

	      while (++j < m) {
	        row = rows[j], nodes = row.children;
	        for (i = row.value = 0, n = nodes.length; i < n; ++i) row.value += nodes[i].value;
	        if (row.dice) treemapDice(row, x0, y0, x1, y0 += (y1 - y0) * row.value / value);
	        else treemapSlice(row, x0, y0, x0 += (x1 - x0) * row.value / value, y1);
	        value -= row.value;
	      }
	    } else {
	      parent._squarify = rows = squarifyRatio(ratio, parent, x0, y0, x1, y1);
	      rows.ratio = ratio;
	    }
	  }

	  resquarify.ratio = function(x) {
	    return custom((x = +x) > 1 ? x : 1);
	  };

	  return resquarify;
	}))(phi);

	var area$1 = function(polygon) {
	  var i = -1,
	      n = polygon.length,
	      a,
	      b = polygon[n - 1],
	      area = 0;

	  while (++i < n) {
	    a = b;
	    b = polygon[i];
	    area += a[1] * b[0] - a[0] * b[1];
	  }

	  return area / 2;
	};

	var centroid$1 = function(polygon) {
	  var i = -1,
	      n = polygon.length,
	      x = 0,
	      y = 0,
	      a,
	      b = polygon[n - 1],
	      c,
	      k = 0;

	  while (++i < n) {
	    a = b;
	    b = polygon[i];
	    k += c = a[0] * b[1] - b[0] * a[1];
	    x += (a[0] + b[0]) * c;
	    y += (a[1] + b[1]) * c;
	  }

	  return k *= 3, [x / k, y / k];
	};

	// Returns the 2D cross product of AB and AC vectors, i.e., the z-component of
	// the 3D cross product in a quadrant I Cartesian coordinate system (+x is
	// right, +y is up). Returns a positive value if ABC is counter-clockwise,
	// negative if clockwise, and zero if the points are collinear.
	var cross$1 = function(a, b, c) {
	  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
	};

	function lexicographicOrder(a, b) {
	  return a[0] - b[0] || a[1] - b[1];
	}

	// Computes the upper convex hull per the monotone chain algorithm.
	// Assumes points.length >= 3, is sorted by x, unique in y.
	// Returns an array of indices into points in left-to-right order.
	function computeUpperHullIndexes(points) {
	  var n = points.length,
	      indexes = [0, 1],
	      size = 2;

	  for (var i = 2; i < n; ++i) {
	    while (size > 1 && cross$1(points[indexes[size - 2]], points[indexes[size - 1]], points[i]) <= 0) --size;
	    indexes[size++] = i;
	  }

	  return indexes.slice(0, size); // remove popped points
	}

	var hull = function(points) {
	  if ((n = points.length) < 3) return null;

	  var i,
	      n,
	      sortedPoints = new Array(n),
	      flippedPoints = new Array(n);

	  for (i = 0; i < n; ++i) sortedPoints[i] = [+points[i][0], +points[i][1], i];
	  sortedPoints.sort(lexicographicOrder);
	  for (i = 0; i < n; ++i) flippedPoints[i] = [sortedPoints[i][0], -sortedPoints[i][1]];

	  var upperIndexes = computeUpperHullIndexes(sortedPoints),
	      lowerIndexes = computeUpperHullIndexes(flippedPoints);

	  // Construct the hull polygon, removing possible duplicate endpoints.
	  var skipLeft = lowerIndexes[0] === upperIndexes[0],
	      skipRight = lowerIndexes[lowerIndexes.length - 1] === upperIndexes[upperIndexes.length - 1],
	      hull = [];

	  // Add upper hull in right-to-l order.
	  // Then add lower hull in left-to-right order.
	  for (i = upperIndexes.length - 1; i >= 0; --i) hull.push(points[sortedPoints[upperIndexes[i]][2]]);
	  for (i = +skipLeft; i < lowerIndexes.length - skipRight; ++i) hull.push(points[sortedPoints[lowerIndexes[i]][2]]);

	  return hull;
	};

	var contains$1 = function(polygon, point) {
	  var n = polygon.length,
	      p = polygon[n - 1],
	      x = point[0], y = point[1],
	      x0 = p[0], y0 = p[1],
	      x1, y1,
	      inside = false;

	  for (var i = 0; i < n; ++i) {
	    p = polygon[i], x1 = p[0], y1 = p[1];
	    if (((y1 > y) !== (y0 > y)) && (x < (x0 - x1) * (y - y1) / (y0 - y1) + x1)) inside = !inside;
	    x0 = x1, y0 = y1;
	  }

	  return inside;
	};

	var length$2 = function(polygon) {
	  var i = -1,
	      n = polygon.length,
	      b = polygon[n - 1],
	      xa,
	      ya,
	      xb = b[0],
	      yb = b[1],
	      perimeter = 0;

	  while (++i < n) {
	    xa = xb;
	    ya = yb;
	    b = polygon[i];
	    xb = b[0];
	    yb = b[1];
	    xa -= xb;
	    ya -= yb;
	    perimeter += Math.sqrt(xa * xa + ya * ya);
	  }

	  return perimeter;
	};

	var slice$3 = [].slice;

	var noabort = {};

	function Queue(size) {
	  if (!(size >= 1)) throw new Error;
	  this._size = size;
	  this._call =
	  this._error = null;
	  this._tasks = [];
	  this._data = [];
	  this._waiting =
	  this._active =
	  this._ended =
	  this._start = 0; // inside a synchronous task callback?
	}

	Queue.prototype = queue.prototype = {
	  constructor: Queue,
	  defer: function(callback) {
	    if (typeof callback !== "function" || this._call) throw new Error;
	    if (this._error != null) return this;
	    var t = slice$3.call(arguments, 1);
	    t.push(callback);
	    ++this._waiting, this._tasks.push(t);
	    poke$1(this);
	    return this;
	  },
	  abort: function() {
	    if (this._error == null) abort(this, new Error("abort"));
	    return this;
	  },
	  await: function(callback) {
	    if (typeof callback !== "function" || this._call) throw new Error;
	    this._call = function(error, results) { callback.apply(null, [error].concat(results)); };
	    maybeNotify(this);
	    return this;
	  },
	  awaitAll: function(callback) {
	    if (typeof callback !== "function" || this._call) throw new Error;
	    this._call = callback;
	    maybeNotify(this);
	    return this;
	  }
	};

	function poke$1(q) {
	  if (!q._start) {
	    try { start$1(q); } // let the current task complete
	    catch (e) {
	      if (q._tasks[q._ended + q._active - 1]) abort(q, e); // task errored synchronously
	      else if (!q._data) throw e; // await callback errored synchronously
	    }
	  }
	}

	function start$1(q) {
	  while (q._start = q._waiting && q._active < q._size) {
	    var i = q._ended + q._active,
	        t = q._tasks[i],
	        j = t.length - 1,
	        c = t[j];
	    t[j] = end(q, i);
	    --q._waiting, ++q._active;
	    t = c.apply(null, t);
	    if (!q._tasks[i]) continue; // task finished synchronously
	    q._tasks[i] = t || noabort;
	  }
	}

	function end(q, i) {
	  return function(e, r) {
	    if (!q._tasks[i]) return; // ignore multiple callbacks
	    --q._active, ++q._ended;
	    q._tasks[i] = null;
	    if (q._error != null) return; // ignore secondary errors
	    if (e != null) {
	      abort(q, e);
	    } else {
	      q._data[i] = r;
	      if (q._waiting) poke$1(q);
	      else maybeNotify(q);
	    }
	  };
	}

	function abort(q, e) {
	  var i = q._tasks.length, t;
	  q._error = e; // ignore active callbacks
	  q._data = undefined; // allow gc
	  q._waiting = NaN; // prevent starting

	  while (--i >= 0) {
	    if (t = q._tasks[i]) {
	      q._tasks[i] = null;
	      if (t.abort) {
	        try { t.abort(); }
	        catch (e) { /* ignore */ }
	      }
	    }
	  }

	  q._active = NaN; // allow notification
	  maybeNotify(q);
	}

	function maybeNotify(q) {
	  if (!q._active && q._call) {
	    var d = q._data;
	    q._data = undefined; // allow gc
	    q._call(q._error, d);
	  }
	}

	function queue(concurrency) {
	  return new Queue(arguments.length ? +concurrency : Infinity);
	}

	var uniform = function(min, max) {
	  min = min == null ? 0 : +min;
	  max = max == null ? 1 : +max;
	  if (arguments.length === 1) max = min, min = 0;
	  else max -= min;
	  return function() {
	    return Math.random() * max + min;
	  };
	};

	var normal = function(mu, sigma) {
	  var x, r;
	  mu = mu == null ? 0 : +mu;
	  sigma = sigma == null ? 1 : +sigma;
	  return function() {
	    var y;

	    // If available, use the second previously-generated uniform random.
	    if (x != null) y = x, x = null;

	    // Otherwise, generate a new x and y.
	    else do {
	      x = Math.random() * 2 - 1;
	      y = Math.random() * 2 - 1;
	      r = x * x + y * y;
	    } while (!r || r > 1);

	    return mu + sigma * y * Math.sqrt(-2 * Math.log(r) / r);
	  };
	};

	var logNormal = function() {
	  var randomNormal = normal.apply(this, arguments);
	  return function() {
	    return Math.exp(randomNormal());
	  };
	};

	var irwinHall = function(n) {
	  return function() {
	    for (var sum = 0, i = 0; i < n; ++i) sum += Math.random();
	    return sum;
	  };
	};

	var bates = function(n) {
	  var randomIrwinHall = irwinHall(n);
	  return function() {
	    return randomIrwinHall() / n;
	  };
	};

	var exponential$1 = function(lambda) {
	  return function() {
	    return -Math.log(1 - Math.random()) / lambda;
	  };
	};

	var request = function(url, callback) {
	  var request,
	      event = dispatch("beforesend", "progress", "load", "error"),
	      mimeType,
	      headers = map$1(),
	      xhr = new XMLHttpRequest,
	      user = null,
	      password = null,
	      response,
	      responseType,
	      timeout = 0;

	  // If IE does not support CORS, use XDomainRequest.
	  if (typeof XDomainRequest !== "undefined"
	      && !("withCredentials" in xhr)
	      && /^(http(s)?:)?\/\//.test(url)) xhr = new XDomainRequest;

	  "onload" in xhr
	      ? xhr.onload = xhr.onerror = xhr.ontimeout = respond
	      : xhr.onreadystatechange = function(o) { xhr.readyState > 3 && respond(o); };

	  function respond(o) {
	    var status = xhr.status, result;
	    if (!status && hasResponse(xhr)
	        || status >= 200 && status < 300
	        || status === 304) {
	      if (response) {
	        try {
	          result = response.call(request, xhr);
	        } catch (e) {
	          event.call("error", request, e);
	          return;
	        }
	      } else {
	        result = xhr;
	      }
	      event.call("load", request, result);
	    } else {
	      event.call("error", request, o);
	    }
	  }

	  xhr.onprogress = function(e) {
	    event.call("progress", request, e);
	  };

	  request = {
	    header: function(name, value) {
	      name = (name + "").toLowerCase();
	      if (arguments.length < 2) return headers.get(name);
	      if (value == null) headers.remove(name);
	      else headers.set(name, value + "");
	      return request;
	    },

	    // If mimeType is non-null and no Accept header is set, a default is used.
	    mimeType: function(value) {
	      if (!arguments.length) return mimeType;
	      mimeType = value == null ? null : value + "";
	      return request;
	    },

	    // Specifies what type the response value should take;
	    // for instance, arraybuffer, blob, document, or text.
	    responseType: function(value) {
	      if (!arguments.length) return responseType;
	      responseType = value;
	      return request;
	    },

	    timeout: function(value) {
	      if (!arguments.length) return timeout;
	      timeout = +value;
	      return request;
	    },

	    user: function(value) {
	      return arguments.length < 1 ? user : (user = value == null ? null : value + "", request);
	    },

	    password: function(value) {
	      return arguments.length < 1 ? password : (password = value == null ? null : value + "", request);
	    },

	    // Specify how to convert the response content to a specific type;
	    // changes the callback value on "load" events.
	    response: function(value) {
	      response = value;
	      return request;
	    },

	    // Alias for send("GET", …).
	    get: function(data, callback) {
	      return request.send("GET", data, callback);
	    },

	    // Alias for send("POST", …).
	    post: function(data, callback) {
	      return request.send("POST", data, callback);
	    },

	    // If callback is non-null, it will be used for error and load events.
	    send: function(method, data, callback) {
	      xhr.open(method, url, true, user, password);
	      if (mimeType != null && !headers.has("accept")) headers.set("accept", mimeType + ",*/*");
	      if (xhr.setRequestHeader) headers.each(function(value, name) { xhr.setRequestHeader(name, value); });
	      if (mimeType != null && xhr.overrideMimeType) xhr.overrideMimeType(mimeType);
	      if (responseType != null) xhr.responseType = responseType;
	      if (timeout > 0) xhr.timeout = timeout;
	      if (callback == null && typeof data === "function") callback = data, data = null;
	      if (callback != null && callback.length === 1) callback = fixCallback(callback);
	      if (callback != null) request.on("error", callback).on("load", function(xhr) { callback(null, xhr); });
	      event.call("beforesend", request, xhr);
	      xhr.send(data == null ? null : data);
	      return request;
	    },

	    abort: function() {
	      xhr.abort();
	      return request;
	    },

	    on: function() {
	      var value = event.on.apply(event, arguments);
	      return value === event ? request : value;
	    }
	  };

	  if (callback != null) {
	    if (typeof callback !== "function") throw new Error("invalid callback: " + callback);
	    return request.get(callback);
	  }

	  return request;
	};

	function fixCallback(callback) {
	  return function(error, xhr) {
	    callback(error == null ? xhr : null);
	  };
	}

	function hasResponse(xhr) {
	  var type = xhr.responseType;
	  return type && type !== "text"
	      ? xhr.response // null on error
	      : xhr.responseText; // "" on error
	}

	var type$1 = function(defaultMimeType, response) {
	  return function(url, callback) {
	    var r = request(url).mimeType(defaultMimeType).response(response);
	    if (callback != null) {
	      if (typeof callback !== "function") throw new Error("invalid callback: " + callback);
	      return r.get(callback);
	    }
	    return r;
	  };
	};

	var html = type$1("text/html", function(xhr) {
	  return document.createRange().createContextualFragment(xhr.responseText);
	});

	var json = type$1("application/json", function(xhr) {
	  return JSON.parse(xhr.responseText);
	});

	var text = type$1("text/plain", function(xhr) {
	  return xhr.responseText;
	});

	var xml = type$1("application/xml", function(xhr) {
	  var xml = xhr.responseXML;
	  if (!xml) throw new Error("parse error");
	  return xml;
	});

	var dsv$1 = function(defaultMimeType, parse) {
	  return function(url, row, callback) {
	    if (arguments.length < 3) callback = row, row = null;
	    var r = request(url).mimeType(defaultMimeType);
	    r.row = function(_) { return arguments.length ? r.response(responseOf(parse, row = _)) : row; };
	    r.row(row);
	    return callback ? r.get(callback) : r;
	  };
	};

	function responseOf(parse, row) {
	  return function(request$$1) {
	    return parse(request$$1.responseText, row);
	  };
	}

	var csv$1 = dsv$1("text/csv", csvParse);

	var tsv$1 = dsv$1("text/tab-separated-values", tsvParse);

	var array$2 = Array.prototype;

	var map$3 = array$2.map;
	var slice$4 = array$2.slice;

	var implicit = {name: "implicit"};

	function ordinal(range) {
	  var index = map$1(),
	      domain = [],
	      unknown = implicit;

	  range = range == null ? [] : slice$4.call(range);

	  function scale(d) {
	    var key = d + "", i = index.get(key);
	    if (!i) {
	      if (unknown !== implicit) return unknown;
	      index.set(key, i = domain.push(d));
	    }
	    return range[(i - 1) % range.length];
	  }

	  scale.domain = function(_) {
	    if (!arguments.length) return domain.slice();
	    domain = [], index = map$1();
	    var i = -1, n = _.length, d, key;
	    while (++i < n) if (!index.has(key = (d = _[i]) + "")) index.set(key, domain.push(d));
	    return scale;
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range = slice$4.call(_), scale) : range.slice();
	  };

	  scale.unknown = function(_) {
	    return arguments.length ? (unknown = _, scale) : unknown;
	  };

	  scale.copy = function() {
	    return ordinal()
	        .domain(domain)
	        .range(range)
	        .unknown(unknown);
	  };

	  return scale;
	}

	function band() {
	  var scale = ordinal().unknown(undefined),
	      domain = scale.domain,
	      ordinalRange = scale.range,
	      range$$1 = [0, 1],
	      step,
	      bandwidth,
	      round = false,
	      paddingInner = 0,
	      paddingOuter = 0,
	      align = 0.5;

	  delete scale.unknown;

	  function rescale() {
	    var n = domain().length,
	        reverse = range$$1[1] < range$$1[0],
	        start = range$$1[reverse - 0],
	        stop = range$$1[1 - reverse];
	    step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
	    if (round) step = Math.floor(step);
	    start += (stop - start - step * (n - paddingInner)) * align;
	    bandwidth = step * (1 - paddingInner);
	    if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
	    var values = sequence(n).map(function(i) { return start + step * i; });
	    return ordinalRange(reverse ? values.reverse() : values);
	  }

	  scale.domain = function(_) {
	    return arguments.length ? (domain(_), rescale()) : domain();
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range$$1 = [+_[0], +_[1]], rescale()) : range$$1.slice();
	  };

	  scale.rangeRound = function(_) {
	    return range$$1 = [+_[0], +_[1]], round = true, rescale();
	  };

	  scale.bandwidth = function() {
	    return bandwidth;
	  };

	  scale.step = function() {
	    return step;
	  };

	  scale.round = function(_) {
	    return arguments.length ? (round = !!_, rescale()) : round;
	  };

	  scale.padding = function(_) {
	    return arguments.length ? (paddingInner = paddingOuter = Math.max(0, Math.min(1, _)), rescale()) : paddingInner;
	  };

	  scale.paddingInner = function(_) {
	    return arguments.length ? (paddingInner = Math.max(0, Math.min(1, _)), rescale()) : paddingInner;
	  };

	  scale.paddingOuter = function(_) {
	    return arguments.length ? (paddingOuter = Math.max(0, Math.min(1, _)), rescale()) : paddingOuter;
	  };

	  scale.align = function(_) {
	    return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
	  };

	  scale.copy = function() {
	    return band()
	        .domain(domain())
	        .range(range$$1)
	        .round(round)
	        .paddingInner(paddingInner)
	        .paddingOuter(paddingOuter)
	        .align(align);
	  };

	  return rescale();
	}

	function pointish(scale) {
	  var copy = scale.copy;

	  scale.padding = scale.paddingOuter;
	  delete scale.paddingInner;
	  delete scale.paddingOuter;

	  scale.copy = function() {
	    return pointish(copy());
	  };

	  return scale;
	}

	function point$1() {
	  return pointish(band().paddingInner(1));
	}

	var constant$9 = function(x) {
	  return function() {
	    return x;
	  };
	};

	var number$1 = function(x) {
	  return +x;
	};

	var unit = [0, 1];

	function deinterpolateLinear(a, b) {
	  return (b -= (a = +a))
	      ? function(x) { return (x - a) / b; }
	      : constant$9(b);
	}

	function deinterpolateClamp(deinterpolate) {
	  return function(a, b) {
	    var d = deinterpolate(a = +a, b = +b);
	    return function(x) { return x <= a ? 0 : x >= b ? 1 : d(x); };
	  };
	}

	function reinterpolateClamp(reinterpolate) {
	  return function(a, b) {
	    var r = reinterpolate(a = +a, b = +b);
	    return function(t) { return t <= 0 ? a : t >= 1 ? b : r(t); };
	  };
	}

	function bimap(domain, range$$1, deinterpolate, reinterpolate) {
	  var d0 = domain[0], d1 = domain[1], r0 = range$$1[0], r1 = range$$1[1];
	  if (d1 < d0) d0 = deinterpolate(d1, d0), r0 = reinterpolate(r1, r0);
	  else d0 = deinterpolate(d0, d1), r0 = reinterpolate(r0, r1);
	  return function(x) { return r0(d0(x)); };
	}

	function polymap(domain, range$$1, deinterpolate, reinterpolate) {
	  var j = Math.min(domain.length, range$$1.length) - 1,
	      d = new Array(j),
	      r = new Array(j),
	      i = -1;

	  // Reverse descending domains.
	  if (domain[j] < domain[0]) {
	    domain = domain.slice().reverse();
	    range$$1 = range$$1.slice().reverse();
	  }

	  while (++i < j) {
	    d[i] = deinterpolate(domain[i], domain[i + 1]);
	    r[i] = reinterpolate(range$$1[i], range$$1[i + 1]);
	  }

	  return function(x) {
	    var i = bisectRight(domain, x, 1, j) - 1;
	    return r[i](d[i](x));
	  };
	}

	function copy(source, target) {
	  return target
	      .domain(source.domain())
	      .range(source.range())
	      .interpolate(source.interpolate())
	      .clamp(source.clamp());
	}

	// deinterpolate(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
	// reinterpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding domain value x in [a,b].
	function continuous(deinterpolate, reinterpolate) {
	  var domain = unit,
	      range$$1 = unit,
	      interpolate$$1 = interpolateValue,
	      clamp = false,
	      piecewise,
	      output,
	      input;

	  function rescale() {
	    piecewise = Math.min(domain.length, range$$1.length) > 2 ? polymap : bimap;
	    output = input = null;
	    return scale;
	  }

	  function scale(x) {
	    return (output || (output = piecewise(domain, range$$1, clamp ? deinterpolateClamp(deinterpolate) : deinterpolate, interpolate$$1)))(+x);
	  }

	  scale.invert = function(y) {
	    return (input || (input = piecewise(range$$1, domain, deinterpolateLinear, clamp ? reinterpolateClamp(reinterpolate) : reinterpolate)))(+y);
	  };

	  scale.domain = function(_) {
	    return arguments.length ? (domain = map$3.call(_, number$1), rescale()) : domain.slice();
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range$$1 = slice$4.call(_), rescale()) : range$$1.slice();
	  };

	  scale.rangeRound = function(_) {
	    return range$$1 = slice$4.call(_), interpolate$$1 = interpolateRound, rescale();
	  };

	  scale.clamp = function(_) {
	    return arguments.length ? (clamp = !!_, rescale()) : clamp;
	  };

	  scale.interpolate = function(_) {
	    return arguments.length ? (interpolate$$1 = _, rescale()) : interpolate$$1;
	  };

	  return rescale();
	}

	var tickFormat = function(domain, count, specifier) {
	  var start = domain[0],
	      stop = domain[domain.length - 1],
	      step = tickStep(start, stop, count == null ? 10 : count),
	      precision;
	  specifier = formatSpecifier(specifier == null ? ",f" : specifier);
	  switch (specifier.type) {
	    case "s": {
	      var value = Math.max(Math.abs(start), Math.abs(stop));
	      if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
	      return exports.formatPrefix(specifier, value);
	    }
	    case "":
	    case "e":
	    case "g":
	    case "p":
	    case "r": {
	      if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
	      break;
	    }
	    case "f":
	    case "%": {
	      if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
	      break;
	    }
	  }
	  return exports.format(specifier);
	};

	function linearish(scale) {
	  var domain = scale.domain;

	  scale.ticks = function(count) {
	    var d = domain();
	    return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
	  };

	  scale.tickFormat = function(count, specifier) {
	    return tickFormat(domain(), count, specifier);
	  };

	  scale.nice = function(count) {
	    var d = domain(),
	        i = d.length - 1,
	        n = count == null ? 10 : count,
	        start = d[0],
	        stop = d[i],
	        step = tickStep(start, stop, n);

	    if (step) {
	      step = tickStep(Math.floor(start / step) * step, Math.ceil(stop / step) * step, n);
	      d[0] = Math.floor(start / step) * step;
	      d[i] = Math.ceil(stop / step) * step;
	      domain(d);
	    }

	    return scale;
	  };

	  return scale;
	}

	function linear$2() {
	  var scale = continuous(deinterpolateLinear, reinterpolate);

	  scale.copy = function() {
	    return copy(scale, linear$2());
	  };

	  return linearish(scale);
	}

	function identity$6() {
	  var domain = [0, 1];

	  function scale(x) {
	    return +x;
	  }

	  scale.invert = scale;

	  scale.domain = scale.range = function(_) {
	    return arguments.length ? (domain = map$3.call(_, number$1), scale) : domain.slice();
	  };

	  scale.copy = function() {
	    return identity$6().domain(domain);
	  };

	  return linearish(scale);
	}

	var nice = function(domain, interval) {
	  domain = domain.slice();

	  var i0 = 0,
	      i1 = domain.length - 1,
	      x0 = domain[i0],
	      x1 = domain[i1],
	      t;

	  if (x1 < x0) {
	    t = i0, i0 = i1, i1 = t;
	    t = x0, x0 = x1, x1 = t;
	  }

	  domain[i0] = interval.floor(x0);
	  domain[i1] = interval.ceil(x1);
	  return domain;
	};

	function deinterpolate(a, b) {
	  return (b = Math.log(b / a))
	      ? function(x) { return Math.log(x / a) / b; }
	      : constant$9(b);
	}

	function reinterpolate$1(a, b) {
	  return a < 0
	      ? function(t) { return -Math.pow(-b, t) * Math.pow(-a, 1 - t); }
	      : function(t) { return Math.pow(b, t) * Math.pow(a, 1 - t); };
	}

	function pow10(x) {
	  return isFinite(x) ? +("1e" + x) : x < 0 ? 0 : x;
	}

	function powp(base) {
	  return base === 10 ? pow10
	      : base === Math.E ? Math.exp
	      : function(x) { return Math.pow(base, x); };
	}

	function logp(base) {
	  return base === Math.E ? Math.log
	      : base === 10 && Math.log10
	      || base === 2 && Math.log2
	      || (base = Math.log(base), function(x) { return Math.log(x) / base; });
	}

	function reflect(f) {
	  return function(x) {
	    return -f(-x);
	  };
	}

	function log$1() {
	  var scale = continuous(deinterpolate, reinterpolate$1).domain([1, 10]),
	      domain = scale.domain,
	      base = 10,
	      logs = logp(10),
	      pows = powp(10);

	  function rescale() {
	    logs = logp(base), pows = powp(base);
	    if (domain()[0] < 0) logs = reflect(logs), pows = reflect(pows);
	    return scale;
	  }

	  scale.base = function(_) {
	    return arguments.length ? (base = +_, rescale()) : base;
	  };

	  scale.domain = function(_) {
	    return arguments.length ? (domain(_), rescale()) : domain();
	  };

	  scale.ticks = function(count) {
	    var d = domain(),
	        u = d[0],
	        v = d[d.length - 1],
	        r;

	    if (r = v < u) i = u, u = v, v = i;

	    var i = logs(u),
	        j = logs(v),
	        p,
	        k,
	        t,
	        n = count == null ? 10 : +count,
	        z = [];

	    if (!(base % 1) && j - i < n) {
	      i = Math.round(i) - 1, j = Math.round(j) + 1;
	      if (u > 0) for (; i < j; ++i) {
	        for (k = 1, p = pows(i); k < base; ++k) {
	          t = p * k;
	          if (t < u) continue;
	          if (t > v) break;
	          z.push(t);
	        }
	      } else for (; i < j; ++i) {
	        for (k = base - 1, p = pows(i); k >= 1; --k) {
	          t = p * k;
	          if (t < u) continue;
	          if (t > v) break;
	          z.push(t);
	        }
	      }
	    } else {
	      z = ticks(i, j, Math.min(j - i, n)).map(pows);
	    }

	    return r ? z.reverse() : z;
	  };

	  scale.tickFormat = function(count, specifier) {
	    if (specifier == null) specifier = base === 10 ? ".0e" : ",";
	    if (typeof specifier !== "function") specifier = exports.format(specifier);
	    if (count === Infinity) return specifier;
	    if (count == null) count = 10;
	    var k = Math.max(1, base * count / scale.ticks().length); // TODO fast estimate?
	    return function(d) {
	      var i = d / pows(Math.round(logs(d)));
	      if (i * base < base - 0.5) i *= base;
	      return i <= k ? specifier(d) : "";
	    };
	  };

	  scale.nice = function() {
	    return domain(nice(domain(), {
	      floor: function(x) { return pows(Math.floor(logs(x))); },
	      ceil: function(x) { return pows(Math.ceil(logs(x))); }
	    }));
	  };

	  scale.copy = function() {
	    return copy(scale, log$1().base(base));
	  };

	  return scale;
	}

	function raise$1(x, exponent) {
	  return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
	}

	function pow$1() {
	  var exponent = 1,
	      scale = continuous(deinterpolate, reinterpolate),
	      domain = scale.domain;

	  function deinterpolate(a, b) {
	    return (b = raise$1(b, exponent) - (a = raise$1(a, exponent)))
	        ? function(x) { return (raise$1(x, exponent) - a) / b; }
	        : constant$9(b);
	  }

	  function reinterpolate(a, b) {
	    b = raise$1(b, exponent) - (a = raise$1(a, exponent));
	    return function(t) { return raise$1(a + b * t, 1 / exponent); };
	  }

	  scale.exponent = function(_) {
	    return arguments.length ? (exponent = +_, domain(domain())) : exponent;
	  };

	  scale.copy = function() {
	    return copy(scale, pow$1().exponent(exponent));
	  };

	  return linearish(scale);
	}

	function sqrt$1() {
	  return pow$1().exponent(0.5);
	}

	function quantile$$1() {
	  var domain = [],
	      range$$1 = [],
	      thresholds = [];

	  function rescale() {
	    var i = 0, n = Math.max(1, range$$1.length);
	    thresholds = new Array(n - 1);
	    while (++i < n) thresholds[i - 1] = threshold(domain, i / n);
	    return scale;
	  }

	  function scale(x) {
	    if (!isNaN(x = +x)) return range$$1[bisectRight(thresholds, x)];
	  }

	  scale.invertExtent = function(y) {
	    var i = range$$1.indexOf(y);
	    return i < 0 ? [NaN, NaN] : [
	      i > 0 ? thresholds[i - 1] : domain[0],
	      i < thresholds.length ? thresholds[i] : domain[domain.length - 1]
	    ];
	  };

	  scale.domain = function(_) {
	    if (!arguments.length) return domain.slice();
	    domain = [];
	    for (var i = 0, n = _.length, d; i < n; ++i) if (d = _[i], d != null && !isNaN(d = +d)) domain.push(d);
	    domain.sort(ascending);
	    return rescale();
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range$$1 = slice$4.call(_), rescale()) : range$$1.slice();
	  };

	  scale.quantiles = function() {
	    return thresholds.slice();
	  };

	  scale.copy = function() {
	    return quantile$$1()
	        .domain(domain)
	        .range(range$$1);
	  };

	  return scale;
	}

	function quantize$1() {
	  var x0 = 0,
	      x1 = 1,
	      n = 1,
	      domain = [0.5],
	      range$$1 = [0, 1];

	  function scale(x) {
	    if (x <= x) return range$$1[bisectRight(domain, x, 0, n)];
	  }

	  function rescale() {
	    var i = -1;
	    domain = new Array(n);
	    while (++i < n) domain[i] = ((i + 1) * x1 - (i - n) * x0) / (n + 1);
	    return scale;
	  }

	  scale.domain = function(_) {
	    return arguments.length ? (x0 = +_[0], x1 = +_[1], rescale()) : [x0, x1];
	  };

	  scale.range = function(_) {
	    return arguments.length ? (n = (range$$1 = slice$4.call(_)).length - 1, rescale()) : range$$1.slice();
	  };

	  scale.invertExtent = function(y) {
	    var i = range$$1.indexOf(y);
	    return i < 0 ? [NaN, NaN]
	        : i < 1 ? [x0, domain[0]]
	        : i >= n ? [domain[n - 1], x1]
	        : [domain[i - 1], domain[i]];
	  };

	  scale.copy = function() {
	    return quantize$1()
	        .domain([x0, x1])
	        .range(range$$1);
	  };

	  return linearish(scale);
	}

	function threshold$1() {
	  var domain = [0.5],
	      range$$1 = [0, 1],
	      n = 1;

	  function scale(x) {
	    if (x <= x) return range$$1[bisectRight(domain, x, 0, n)];
	  }

	  scale.domain = function(_) {
	    return arguments.length ? (domain = slice$4.call(_), n = Math.min(domain.length, range$$1.length - 1), scale) : domain.slice();
	  };

	  scale.range = function(_) {
	    return arguments.length ? (range$$1 = slice$4.call(_), n = Math.min(domain.length, range$$1.length - 1), scale) : range$$1.slice();
	  };

	  scale.invertExtent = function(y) {
	    var i = range$$1.indexOf(y);
	    return [domain[i - 1], domain[i]];
	  };

	  scale.copy = function() {
	    return threshold$1()
	        .domain(domain)
	        .range(range$$1);
	  };

	  return scale;
	}

	var t0$1 = new Date;
	var t1$1 = new Date;

	function newInterval(floori, offseti, count, field) {

	  function interval(date) {
	    return floori(date = new Date(+date)), date;
	  }

	  interval.floor = interval;

	  interval.ceil = function(date) {
	    return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
	  };

	  interval.round = function(date) {
	    var d0 = interval(date),
	        d1 = interval.ceil(date);
	    return date - d0 < d1 - date ? d0 : d1;
	  };

	  interval.offset = function(date, step) {
	    return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
	  };

	  interval.range = function(start, stop, step) {
	    var range = [];
	    start = interval.ceil(start);
	    step = step == null ? 1 : Math.floor(step);
	    if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
	    do range.push(new Date(+start)); while (offseti(start, step), floori(start), start < stop)
	    return range;
	  };

	  interval.filter = function(test) {
	    return newInterval(function(date) {
	      if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
	    }, function(date, step) {
	      if (date >= date) while (--step >= 0) while (offseti(date, 1), !test(date)) {} // eslint-disable-line no-empty
	    });
	  };

	  if (count) {
	    interval.count = function(start, end) {
	      t0$1.setTime(+start), t1$1.setTime(+end);
	      floori(t0$1), floori(t1$1);
	      return Math.floor(count(t0$1, t1$1));
	    };

	    interval.every = function(step) {
	      step = Math.floor(step);
	      return !isFinite(step) || !(step > 0) ? null
	          : !(step > 1) ? interval
	          : interval.filter(field
	              ? function(d) { return field(d) % step === 0; }
	              : function(d) { return interval.count(0, d) % step === 0; });
	    };
	  }

	  return interval;
	}

	var millisecond = newInterval(function() {
	  // noop
	}, function(date, step) {
	  date.setTime(+date + step);
	}, function(start, end) {
	  return end - start;
	});

	// An optimized implementation for this simple case.
	millisecond.every = function(k) {
	  k = Math.floor(k);
	  if (!isFinite(k) || !(k > 0)) return null;
	  if (!(k > 1)) return millisecond;
	  return newInterval(function(date) {
	    date.setTime(Math.floor(date / k) * k);
	  }, function(date, step) {
	    date.setTime(+date + step * k);
	  }, function(start, end) {
	    return (end - start) / k;
	  });
	};

	var milliseconds = millisecond.range;

	var durationSecond$1 = 1e3;
	var durationMinute$1 = 6e4;
	var durationHour$1 = 36e5;
	var durationDay$1 = 864e5;
	var durationWeek$1 = 6048e5;

	var second = newInterval(function(date) {
	  date.setTime(Math.floor(date / durationSecond$1) * durationSecond$1);
	}, function(date, step) {
	  date.setTime(+date + step * durationSecond$1);
	}, function(start, end) {
	  return (end - start) / durationSecond$1;
	}, function(date) {
	  return date.getUTCSeconds();
	});

	var seconds = second.range;

	var minute = newInterval(function(date) {
	  date.setTime(Math.floor(date / durationMinute$1) * durationMinute$1);
	}, function(date, step) {
	  date.setTime(+date + step * durationMinute$1);
	}, function(start, end) {
	  return (end - start) / durationMinute$1;
	}, function(date) {
	  return date.getMinutes();
	});

	var minutes = minute.range;

	var hour = newInterval(function(date) {
	  var offset = date.getTimezoneOffset() * durationMinute$1 % durationHour$1;
	  if (offset < 0) offset += durationHour$1;
	  date.setTime(Math.floor((+date - offset) / durationHour$1) * durationHour$1 + offset);
	}, function(date, step) {
	  date.setTime(+date + step * durationHour$1);
	}, function(start, end) {
	  return (end - start) / durationHour$1;
	}, function(date) {
	  return date.getHours();
	});

	var hours = hour.range;

	var day = newInterval(function(date) {
	  date.setHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setDate(date.getDate() + step);
	}, function(start, end) {
	  return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute$1) / durationDay$1;
	}, function(date) {
	  return date.getDate() - 1;
	});

	var days = day.range;

	function weekday(i) {
	  return newInterval(function(date) {
	    date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
	    date.setHours(0, 0, 0, 0);
	  }, function(date, step) {
	    date.setDate(date.getDate() + step * 7);
	  }, function(start, end) {
	    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute$1) / durationWeek$1;
	  });
	}

	var sunday = weekday(0);
	var monday = weekday(1);
	var tuesday = weekday(2);
	var wednesday = weekday(3);
	var thursday = weekday(4);
	var friday = weekday(5);
	var saturday = weekday(6);

	var sundays = sunday.range;
	var mondays = monday.range;
	var tuesdays = tuesday.range;
	var wednesdays = wednesday.range;
	var thursdays = thursday.range;
	var fridays = friday.range;
	var saturdays = saturday.range;

	var month = newInterval(function(date) {
	  date.setDate(1);
	  date.setHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setMonth(date.getMonth() + step);
	}, function(start, end) {
	  return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
	}, function(date) {
	  return date.getMonth();
	});

	var months = month.range;

	var year = newInterval(function(date) {
	  date.setMonth(0, 1);
	  date.setHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setFullYear(date.getFullYear() + step);
	}, function(start, end) {
	  return end.getFullYear() - start.getFullYear();
	}, function(date) {
	  return date.getFullYear();
	});

	// An optimized implementation for this simple case.
	year.every = function(k) {
	  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
	    date.setFullYear(Math.floor(date.getFullYear() / k) * k);
	    date.setMonth(0, 1);
	    date.setHours(0, 0, 0, 0);
	  }, function(date, step) {
	    date.setFullYear(date.getFullYear() + step * k);
	  });
	};

	var years = year.range;

	var utcMinute = newInterval(function(date) {
	  date.setUTCSeconds(0, 0);
	}, function(date, step) {
	  date.setTime(+date + step * durationMinute$1);
	}, function(start, end) {
	  return (end - start) / durationMinute$1;
	}, function(date) {
	  return date.getUTCMinutes();
	});

	var utcMinutes = utcMinute.range;

	var utcHour = newInterval(function(date) {
	  date.setUTCMinutes(0, 0, 0);
	}, function(date, step) {
	  date.setTime(+date + step * durationHour$1);
	}, function(start, end) {
	  return (end - start) / durationHour$1;
	}, function(date) {
	  return date.getUTCHours();
	});

	var utcHours = utcHour.range;

	var utcDay = newInterval(function(date) {
	  date.setUTCHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setUTCDate(date.getUTCDate() + step);
	}, function(start, end) {
	  return (end - start) / durationDay$1;
	}, function(date) {
	  return date.getUTCDate() - 1;
	});

	var utcDays = utcDay.range;

	function utcWeekday(i) {
	  return newInterval(function(date) {
	    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
	    date.setUTCHours(0, 0, 0, 0);
	  }, function(date, step) {
	    date.setUTCDate(date.getUTCDate() + step * 7);
	  }, function(start, end) {
	    return (end - start) / durationWeek$1;
	  });
	}

	var utcSunday = utcWeekday(0);
	var utcMonday = utcWeekday(1);
	var utcTuesday = utcWeekday(2);
	var utcWednesday = utcWeekday(3);
	var utcThursday = utcWeekday(4);
	var utcFriday = utcWeekday(5);
	var utcSaturday = utcWeekday(6);

	var utcSundays = utcSunday.range;
	var utcMondays = utcMonday.range;
	var utcTuesdays = utcTuesday.range;
	var utcWednesdays = utcWednesday.range;
	var utcThursdays = utcThursday.range;
	var utcFridays = utcFriday.range;
	var utcSaturdays = utcSaturday.range;

	var utcMonth = newInterval(function(date) {
	  date.setUTCDate(1);
	  date.setUTCHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setUTCMonth(date.getUTCMonth() + step);
	}, function(start, end) {
	  return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
	}, function(date) {
	  return date.getUTCMonth();
	});

	var utcMonths = utcMonth.range;

	var utcYear = newInterval(function(date) {
	  date.setUTCMonth(0, 1);
	  date.setUTCHours(0, 0, 0, 0);
	}, function(date, step) {
	  date.setUTCFullYear(date.getUTCFullYear() + step);
	}, function(start, end) {
	  return end.getUTCFullYear() - start.getUTCFullYear();
	}, function(date) {
	  return date.getUTCFullYear();
	});

	// An optimized implementation for this simple case.
	utcYear.every = function(k) {
	  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
	    date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
	    date.setUTCMonth(0, 1);
	    date.setUTCHours(0, 0, 0, 0);
	  }, function(date, step) {
	    date.setUTCFullYear(date.getUTCFullYear() + step * k);
	  });
	};

	var utcYears = utcYear.range;

	function localDate(d) {
	  if (0 <= d.y && d.y < 100) {
	    var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
	    date.setFullYear(d.y);
	    return date;
	  }
	  return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
	}

	function utcDate(d) {
	  if (0 <= d.y && d.y < 100) {
	    var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
	    date.setUTCFullYear(d.y);
	    return date;
	  }
	  return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
	}

	function newYear(y) {
	  return {y: y, m: 0, d: 1, H: 0, M: 0, S: 0, L: 0};
	}

	function formatLocale$1(locale) {
	  var locale_dateTime = locale.dateTime,
	      locale_date = locale.date,
	      locale_time = locale.time,
	      locale_periods = locale.periods,
	      locale_weekdays = locale.days,
	      locale_shortWeekdays = locale.shortDays,
	      locale_months = locale.months,
	      locale_shortMonths = locale.shortMonths;

	  var periodRe = formatRe(locale_periods),
	      periodLookup = formatLookup(locale_periods),
	      weekdayRe = formatRe(locale_weekdays),
	      weekdayLookup = formatLookup(locale_weekdays),
	      shortWeekdayRe = formatRe(locale_shortWeekdays),
	      shortWeekdayLookup = formatLookup(locale_shortWeekdays),
	      monthRe = formatRe(locale_months),
	      monthLookup = formatLookup(locale_months),
	      shortMonthRe = formatRe(locale_shortMonths),
	      shortMonthLookup = formatLookup(locale_shortMonths);

	  var formats = {
	    "a": formatShortWeekday,
	    "A": formatWeekday,
	    "b": formatShortMonth,
	    "B": formatMonth,
	    "c": null,
	    "d": formatDayOfMonth,
	    "e": formatDayOfMonth,
	    "H": formatHour24,
	    "I": formatHour12,
	    "j": formatDayOfYear,
	    "L": formatMilliseconds,
	    "m": formatMonthNumber,
	    "M": formatMinutes,
	    "p": formatPeriod,
	    "S": formatSeconds,
	    "U": formatWeekNumberSunday,
	    "w": formatWeekdayNumber,
	    "W": formatWeekNumberMonday,
	    "x": null,
	    "X": null,
	    "y": formatYear,
	    "Y": formatFullYear,
	    "Z": formatZone,
	    "%": formatLiteralPercent
	  };

	  var utcFormats = {
	    "a": formatUTCShortWeekday,
	    "A": formatUTCWeekday,
	    "b": formatUTCShortMonth,
	    "B": formatUTCMonth,
	    "c": null,
	    "d": formatUTCDayOfMonth,
	    "e": formatUTCDayOfMonth,
	    "H": formatUTCHour24,
	    "I": formatUTCHour12,
	    "j": formatUTCDayOfYear,
	    "L": formatUTCMilliseconds,
	    "m": formatUTCMonthNumber,
	    "M": formatUTCMinutes,
	    "p": formatUTCPeriod,
	    "S": formatUTCSeconds,
	    "U": formatUTCWeekNumberSunday,
	    "w": formatUTCWeekdayNumber,
	    "W": formatUTCWeekNumberMonday,
	    "x": null,
	    "X": null,
	    "y": formatUTCYear,
	    "Y": formatUTCFullYear,
	    "Z": formatUTCZone,
	    "%": formatLiteralPercent
	  };

	  var parses = {
	    "a": parseShortWeekday,
	    "A": parseWeekday,
	    "b": parseShortMonth,
	    "B": parseMonth,
	    "c": parseLocaleDateTime,
	    "d": parseDayOfMonth,
	    "e": parseDayOfMonth,
	    "H": parseHour24,
	    "I": parseHour24,
	    "j": parseDayOfYear,
	    "L": parseMilliseconds,
	    "m": parseMonthNumber,
	    "M": parseMinutes,
	    "p": parsePeriod,
	    "S": parseSeconds,
	    "U": parseWeekNumberSunday,
	    "w": parseWeekdayNumber,
	    "W": parseWeekNumberMonday,
	    "x": parseLocaleDate,
	    "X": parseLocaleTime,
	    "y": parseYear,
	    "Y": parseFullYear,
	    "Z": parseZone,
	    "%": parseLiteralPercent
	  };

	  // These recursive directive definitions must be deferred.
	  formats.x = newFormat(locale_date, formats);
	  formats.X = newFormat(locale_time, formats);
	  formats.c = newFormat(locale_dateTime, formats);
	  utcFormats.x = newFormat(locale_date, utcFormats);
	  utcFormats.X = newFormat(locale_time, utcFormats);
	  utcFormats.c = newFormat(locale_dateTime, utcFormats);

	  function newFormat(specifier, formats) {
	    return function(date) {
	      var string = [],
	          i = -1,
	          j = 0,
	          n = specifier.length,
	          c,
	          pad,
	          format;

	      if (!(date instanceof Date)) date = new Date(+date);

	      while (++i < n) {
	        if (specifier.charCodeAt(i) === 37) {
	          string.push(specifier.slice(j, i));
	          if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
	          else pad = c === "e" ? " " : "0";
	          if (format = formats[c]) c = format(date, pad);
	          string.push(c);
	          j = i + 1;
	        }
	      }

	      string.push(specifier.slice(j, i));
	      return string.join("");
	    };
	  }

	  function newParse(specifier, newDate) {
	    return function(string) {
	      var d = newYear(1900),
	          i = parseSpecifier(d, specifier, string += "", 0);
	      if (i != string.length) return null;

	      // The am-pm flag is 0 for AM, and 1 for PM.
	      if ("p" in d) d.H = d.H % 12 + d.p * 12;

	      // Convert day-of-week and week-of-year to day-of-year.
	      if ("W" in d || "U" in d) {
	        if (!("w" in d)) d.w = "W" in d ? 1 : 0;
	        var day$$1 = "Z" in d ? utcDate(newYear(d.y)).getUTCDay() : newDate(newYear(d.y)).getDay();
	        d.m = 0;
	        d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day$$1 + 5) % 7 : d.w + d.U * 7 - (day$$1 + 6) % 7;
	      }

	      // If a time zone is specified, all fields are interpreted as UTC and then
	      // offset according to the specified time zone.
	      if ("Z" in d) {
	        d.H += d.Z / 100 | 0;
	        d.M += d.Z % 100;
	        return utcDate(d);
	      }

	      // Otherwise, all fields are in local time.
	      return newDate(d);
	    };
	  }

	  function parseSpecifier(d, specifier, string, j) {
	    var i = 0,
	        n = specifier.length,
	        m = string.length,
	        c,
	        parse;

	    while (i < n) {
	      if (j >= m) return -1;
	      c = specifier.charCodeAt(i++);
	      if (c === 37) {
	        c = specifier.charAt(i++);
	        parse = parses[c in pads ? specifier.charAt(i++) : c];
	        if (!parse || ((j = parse(d, string, j)) < 0)) return -1;
	      } else if (c != string.charCodeAt(j++)) {
	        return -1;
	      }
	    }

	    return j;
	  }

	  function parsePeriod(d, string, i) {
	    var n = periodRe.exec(string.slice(i));
	    return n ? (d.p = periodLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseShortWeekday(d, string, i) {
	    var n = shortWeekdayRe.exec(string.slice(i));
	    return n ? (d.w = shortWeekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseWeekday(d, string, i) {
	    var n = weekdayRe.exec(string.slice(i));
	    return n ? (d.w = weekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseShortMonth(d, string, i) {
	    var n = shortMonthRe.exec(string.slice(i));
	    return n ? (d.m = shortMonthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseMonth(d, string, i) {
	    var n = monthRe.exec(string.slice(i));
	    return n ? (d.m = monthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
	  }

	  function parseLocaleDateTime(d, string, i) {
	    return parseSpecifier(d, locale_dateTime, string, i);
	  }

	  function parseLocaleDate(d, string, i) {
	    return parseSpecifier(d, locale_date, string, i);
	  }

	  function parseLocaleTime(d, string, i) {
	    return parseSpecifier(d, locale_time, string, i);
	  }

	  function formatShortWeekday(d) {
	    return locale_shortWeekdays[d.getDay()];
	  }

	  function formatWeekday(d) {
	    return locale_weekdays[d.getDay()];
	  }

	  function formatShortMonth(d) {
	    return locale_shortMonths[d.getMonth()];
	  }

	  function formatMonth(d) {
	    return locale_months[d.getMonth()];
	  }

	  function formatPeriod(d) {
	    return locale_periods[+(d.getHours() >= 12)];
	  }

	  function formatUTCShortWeekday(d) {
	    return locale_shortWeekdays[d.getUTCDay()];
	  }

	  function formatUTCWeekday(d) {
	    return locale_weekdays[d.getUTCDay()];
	  }

	  function formatUTCShortMonth(d) {
	    return locale_shortMonths[d.getUTCMonth()];
	  }

	  function formatUTCMonth(d) {
	    return locale_months[d.getUTCMonth()];
	  }

	  function formatUTCPeriod(d) {
	    return locale_periods[+(d.getUTCHours() >= 12)];
	  }

	  return {
	    format: function(specifier) {
	      var f = newFormat(specifier += "", formats);
	      f.toString = function() { return specifier; };
	      return f;
	    },
	    parse: function(specifier) {
	      var p = newParse(specifier += "", localDate);
	      p.toString = function() { return specifier; };
	      return p;
	    },
	    utcFormat: function(specifier) {
	      var f = newFormat(specifier += "", utcFormats);
	      f.toString = function() { return specifier; };
	      return f;
	    },
	    utcParse: function(specifier) {
	      var p = newParse(specifier, utcDate);
	      p.toString = function() { return specifier; };
	      return p;
	    }
	  };
	}

	var pads = {"-": "", "_": " ", "0": "0"};
	var numberRe = /^\s*\d+/;
	var percentRe = /^%/;
	var requoteRe = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;

	function pad(value, fill, width) {
	  var sign = value < 0 ? "-" : "",
	      string = (sign ? -value : value) + "",
	      length = string.length;
	  return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
	}

	function requote(s) {
	  return s.replace(requoteRe, "\\$&");
	}

	function formatRe(names) {
	  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
	}

	function formatLookup(names) {
	  var map = {}, i = -1, n = names.length;
	  while (++i < n) map[names[i].toLowerCase()] = i;
	  return map;
	}

	function parseWeekdayNumber(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 1));
	  return n ? (d.w = +n[0], i + n[0].length) : -1;
	}

	function parseWeekNumberSunday(d, string, i) {
	  var n = numberRe.exec(string.slice(i));
	  return n ? (d.U = +n[0], i + n[0].length) : -1;
	}

	function parseWeekNumberMonday(d, string, i) {
	  var n = numberRe.exec(string.slice(i));
	  return n ? (d.W = +n[0], i + n[0].length) : -1;
	}

	function parseFullYear(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 4));
	  return n ? (d.y = +n[0], i + n[0].length) : -1;
	}

	function parseYear(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
	}

	function parseZone(d, string, i) {
	  var n = /^(Z)|([+-]\d\d)(?:\:?(\d\d))?/.exec(string.slice(i, i + 6));
	  return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
	}

	function parseMonthNumber(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
	}

	function parseDayOfMonth(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.d = +n[0], i + n[0].length) : -1;
	}

	function parseDayOfYear(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 3));
	  return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
	}

	function parseHour24(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.H = +n[0], i + n[0].length) : -1;
	}

	function parseMinutes(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.M = +n[0], i + n[0].length) : -1;
	}

	function parseSeconds(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 2));
	  return n ? (d.S = +n[0], i + n[0].length) : -1;
	}

	function parseMilliseconds(d, string, i) {
	  var n = numberRe.exec(string.slice(i, i + 3));
	  return n ? (d.L = +n[0], i + n[0].length) : -1;
	}

	function parseLiteralPercent(d, string, i) {
	  var n = percentRe.exec(string.slice(i, i + 1));
	  return n ? i + n[0].length : -1;
	}

	function formatDayOfMonth(d, p) {
	  return pad(d.getDate(), p, 2);
	}

	function formatHour24(d, p) {
	  return pad(d.getHours(), p, 2);
	}

	function formatHour12(d, p) {
	  return pad(d.getHours() % 12 || 12, p, 2);
	}

	function formatDayOfYear(d, p) {
	  return pad(1 + day.count(year(d), d), p, 3);
	}

	function formatMilliseconds(d, p) {
	  return pad(d.getMilliseconds(), p, 3);
	}

	function formatMonthNumber(d, p) {
	  return pad(d.getMonth() + 1, p, 2);
	}

	function formatMinutes(d, p) {
	  return pad(d.getMinutes(), p, 2);
	}

	function formatSeconds(d, p) {
	  return pad(d.getSeconds(), p, 2);
	}

	function formatWeekNumberSunday(d, p) {
	  return pad(sunday.count(year(d), d), p, 2);
	}

	function formatWeekdayNumber(d) {
	  return d.getDay();
	}

	function formatWeekNumberMonday(d, p) {
	  return pad(monday.count(year(d), d), p, 2);
	}

	function formatYear(d, p) {
	  return pad(d.getFullYear() % 100, p, 2);
	}

	function formatFullYear(d, p) {
	  return pad(d.getFullYear() % 10000, p, 4);
	}

	function formatZone(d) {
	  var z = d.getTimezoneOffset();
	  return (z > 0 ? "-" : (z *= -1, "+"))
	      + pad(z / 60 | 0, "0", 2)
	      + pad(z % 60, "0", 2);
	}

	function formatUTCDayOfMonth(d, p) {
	  return pad(d.getUTCDate(), p, 2);
	}

	function formatUTCHour24(d, p) {
	  return pad(d.getUTCHours(), p, 2);
	}

	function formatUTCHour12(d, p) {
	  return pad(d.getUTCHours() % 12 || 12, p, 2);
	}

	function formatUTCDayOfYear(d, p) {
	  return pad(1 + utcDay.count(utcYear(d), d), p, 3);
	}

	function formatUTCMilliseconds(d, p) {
	  return pad(d.getUTCMilliseconds(), p, 3);
	}

	function formatUTCMonthNumber(d, p) {
	  return pad(d.getUTCMonth() + 1, p, 2);
	}

	function formatUTCMinutes(d, p) {
	  return pad(d.getUTCMinutes(), p, 2);
	}

	function formatUTCSeconds(d, p) {
	  return pad(d.getUTCSeconds(), p, 2);
	}

	function formatUTCWeekNumberSunday(d, p) {
	  return pad(utcSunday.count(utcYear(d), d), p, 2);
	}

	function formatUTCWeekdayNumber(d) {
	  return d.getUTCDay();
	}

	function formatUTCWeekNumberMonday(d, p) {
	  return pad(utcMonday.count(utcYear(d), d), p, 2);
	}

	function formatUTCYear(d, p) {
	  return pad(d.getUTCFullYear() % 100, p, 2);
	}

	function formatUTCFullYear(d, p) {
	  return pad(d.getUTCFullYear() % 10000, p, 4);
	}

	function formatUTCZone() {
	  return "+0000";
	}

	function formatLiteralPercent() {
	  return "%";
	}

	var locale$2;





	defaultLocale$1({
	  dateTime: "%x, %X",
	  date: "%-m/%-d/%Y",
	  time: "%-I:%M:%S %p",
	  periods: ["AM", "PM"],
	  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	});

	function defaultLocale$1(definition) {
	  locale$2 = formatLocale$1(definition);
	  exports.timeFormat = locale$2.format;
	  exports.timeParse = locale$2.parse;
	  exports.utcFormat = locale$2.utcFormat;
	  exports.utcParse = locale$2.utcParse;
	  return locale$2;
	}

	var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";

	function formatIsoNative(date) {
	  return date.toISOString();
	}

	var formatIso = Date.prototype.toISOString
	    ? formatIsoNative
	    : exports.utcFormat(isoSpecifier);

	function parseIsoNative(string) {
	  var date = new Date(string);
	  return isNaN(date) ? null : date;
	}

	var parseIso = +new Date("2000-01-01T00:00:00.000Z")
	    ? parseIsoNative
	    : exports.utcParse(isoSpecifier);

	var durationSecond = 1000;
	var durationMinute = durationSecond * 60;
	var durationHour = durationMinute * 60;
	var durationDay = durationHour * 24;
	var durationWeek = durationDay * 7;
	var durationMonth = durationDay * 30;
	var durationYear = durationDay * 365;

	function date$1(t) {
	  return new Date(t);
	}

	function number$2(t) {
	  return t instanceof Date ? +t : +new Date(+t);
	}

	function calendar(year$$1, month$$1, week, day$$1, hour$$1, minute$$1, second$$1, millisecond$$1, format) {
	  var scale = continuous(deinterpolateLinear, reinterpolate),
	      invert = scale.invert,
	      domain = scale.domain;

	  var formatMillisecond = format(".%L"),
	      formatSecond = format(":%S"),
	      formatMinute = format("%I:%M"),
	      formatHour = format("%I %p"),
	      formatDay = format("%a %d"),
	      formatWeek = format("%b %d"),
	      formatMonth = format("%B"),
	      formatYear = format("%Y");

	  var tickIntervals = [
	    [second$$1,  1,      durationSecond],
	    [second$$1,  5,  5 * durationSecond],
	    [second$$1, 15, 15 * durationSecond],
	    [second$$1, 30, 30 * durationSecond],
	    [minute$$1,  1,      durationMinute],
	    [minute$$1,  5,  5 * durationMinute],
	    [minute$$1, 15, 15 * durationMinute],
	    [minute$$1, 30, 30 * durationMinute],
	    [  hour$$1,  1,      durationHour  ],
	    [  hour$$1,  3,  3 * durationHour  ],
	    [  hour$$1,  6,  6 * durationHour  ],
	    [  hour$$1, 12, 12 * durationHour  ],
	    [   day$$1,  1,      durationDay   ],
	    [   day$$1,  2,  2 * durationDay   ],
	    [  week,  1,      durationWeek  ],
	    [ month$$1,  1,      durationMonth ],
	    [ month$$1,  3,  3 * durationMonth ],
	    [  year$$1,  1,      durationYear  ]
	  ];

	  function tickFormat(date) {
	    return (second$$1(date) < date ? formatMillisecond
	        : minute$$1(date) < date ? formatSecond
	        : hour$$1(date) < date ? formatMinute
	        : day$$1(date) < date ? formatHour
	        : month$$1(date) < date ? (week(date) < date ? formatDay : formatWeek)
	        : year$$1(date) < date ? formatMonth
	        : formatYear)(date);
	  }

	  function tickInterval(interval, start, stop, step) {
	    if (interval == null) interval = 10;

	    // If a desired tick count is specified, pick a reasonable tick interval
	    // based on the extent of the domain and a rough estimate of tick size.
	    // Otherwise, assume interval is already a time interval and use it.
	    if (typeof interval === "number") {
	      var target = Math.abs(stop - start) / interval,
	          i = bisector(function(i) { return i[2]; }).right(tickIntervals, target);
	      if (i === tickIntervals.length) {
	        step = tickStep(start / durationYear, stop / durationYear, interval);
	        interval = year$$1;
	      } else if (i) {
	        i = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
	        step = i[1];
	        interval = i[0];
	      } else {
	        step = tickStep(start, stop, interval);
	        interval = millisecond$$1;
	      }
	    }

	    return step == null ? interval : interval.every(step);
	  }

	  scale.invert = function(y) {
	    return new Date(invert(y));
	  };

	  scale.domain = function(_) {
	    return arguments.length ? domain(map$3.call(_, number$2)) : domain().map(date$1);
	  };

	  scale.ticks = function(interval, step) {
	    var d = domain(),
	        t0 = d[0],
	        t1 = d[d.length - 1],
	        r = t1 < t0,
	        t;
	    if (r) t = t0, t0 = t1, t1 = t;
	    t = tickInterval(interval, t0, t1, step);
	    t = t ? t.range(t0, t1 + 1) : []; // inclusive stop
	    return r ? t.reverse() : t;
	  };

	  scale.tickFormat = function(count, specifier) {
	    return specifier == null ? tickFormat : format(specifier);
	  };

	  scale.nice = function(interval, step) {
	    var d = domain();
	    return (interval = tickInterval(interval, d[0], d[d.length - 1], step))
	        ? domain(nice(d, interval))
	        : scale;
	  };

	  scale.copy = function() {
	    return copy(scale, calendar(year$$1, month$$1, week, day$$1, hour$$1, minute$$1, second$$1, millisecond$$1, format));
	  };

	  return scale;
	}

	var time = function() {
	  return calendar(year, month, sunday, day, hour, minute, second, millisecond, exports.timeFormat).domain([new Date(2000, 0, 1), new Date(2000, 0, 2)]);
	};

	var utcTime = function() {
	  return calendar(utcYear, utcMonth, utcSunday, utcDay, utcHour, utcMinute, second, millisecond, exports.utcFormat).domain([Date.UTC(2000, 0, 1), Date.UTC(2000, 0, 2)]);
	};

	var colors = function(s) {
	  return s.match(/.{6}/g).map(function(x) {
	    return "#" + x;
	  });
	};

	var category10 = colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

	var category20b = colors("393b795254a36b6ecf9c9ede6379398ca252b5cf6bcedb9c8c6d31bd9e39e7ba52e7cb94843c39ad494ad6616be7969c7b4173a55194ce6dbdde9ed6");

	var category20c = colors("3182bd6baed69ecae1c6dbefe6550dfd8d3cfdae6bfdd0a231a35474c476a1d99bc7e9c0756bb19e9ac8bcbddcdadaeb636363969696bdbdbdd9d9d9");

	var category20 = colors("1f77b4aec7e8ff7f0effbb782ca02c98df8ad62728ff98969467bdc5b0d58c564bc49c94e377c2f7b6d27f7f7fc7c7c7bcbd22dbdb8d17becf9edae5");

	var cubehelix$3 = cubehelixLong(cubehelix(300, 0.5, 0.0), cubehelix(-240, 0.5, 1.0));

	var warm = cubehelixLong(cubehelix(-100, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

	var cool = cubehelixLong(cubehelix(260, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

	var rainbow = cubehelix();

	var rainbow$1 = function(t) {
	  if (t < 0 || t > 1) t -= Math.floor(t);
	  var ts = Math.abs(t - 0.5);
	  rainbow.h = 360 * t - 100;
	  rainbow.s = 1.5 - 1.5 * ts;
	  rainbow.l = 0.8 - 0.9 * ts;
	  return rainbow + "";
	};

	function ramp(range) {
	  var n = range.length;
	  return function(t) {
	    return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
	  };
	}

	var viridis = ramp(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));

	var magma = ramp(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));

	var inferno = ramp(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));

	var plasma = ramp(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

	function sequential(interpolator) {
	  var x0 = 0,
	      x1 = 1,
	      clamp = false;

	  function scale(x) {
	    var t = (x - x0) / (x1 - x0);
	    return interpolator(clamp ? Math.max(0, Math.min(1, t)) : t);
	  }

	  scale.domain = function(_) {
	    return arguments.length ? (x0 = +_[0], x1 = +_[1], scale) : [x0, x1];
	  };

	  scale.clamp = function(_) {
	    return arguments.length ? (clamp = !!_, scale) : clamp;
	  };

	  scale.interpolator = function(_) {
	    return arguments.length ? (interpolator = _, scale) : interpolator;
	  };

	  scale.copy = function() {
	    return sequential(interpolator).domain([x0, x1]).clamp(clamp);
	  };

	  return linearish(scale);
	}

	var constant$10 = function(x) {
	  return function constant() {
	    return x;
	  };
	};

	var abs$1 = Math.abs;
	var atan2$1 = Math.atan2;
	var cos$2 = Math.cos;
	var max$2 = Math.max;
	var min$1 = Math.min;
	var sin$2 = Math.sin;
	var sqrt$2 = Math.sqrt;

	var epsilon$3 = 1e-12;
	var pi$4 = Math.PI;
	var halfPi$3 = pi$4 / 2;
	var tau$4 = 2 * pi$4;

	function acos$1(x) {
	  return x > 1 ? 0 : x < -1 ? pi$4 : Math.acos(x);
	}

	function asin$1(x) {
	  return x >= 1 ? halfPi$3 : x <= -1 ? -halfPi$3 : Math.asin(x);
	}

	function arcInnerRadius(d) {
	  return d.innerRadius;
	}

	function arcOuterRadius(d) {
	  return d.outerRadius;
	}

	function arcStartAngle(d) {
	  return d.startAngle;
	}

	function arcEndAngle(d) {
	  return d.endAngle;
	}

	function arcPadAngle(d) {
	  return d && d.padAngle; // Note: optional!
	}

	function intersect(x0, y0, x1, y1, x2, y2, x3, y3) {
	  var x10 = x1 - x0, y10 = y1 - y0,
	      x32 = x3 - x2, y32 = y3 - y2,
	      t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / (y32 * x10 - x32 * y10);
	  return [x0 + t * x10, y0 + t * y10];
	}

	// Compute perpendicular offset line of length rc.
	// http://mathworld.wolfram.com/Circle-LineIntersection.html
	function cornerTangents(x0, y0, x1, y1, r1, rc, cw) {
	  var x01 = x0 - x1,
	      y01 = y0 - y1,
	      lo = (cw ? rc : -rc) / sqrt$2(x01 * x01 + y01 * y01),
	      ox = lo * y01,
	      oy = -lo * x01,
	      x11 = x0 + ox,
	      y11 = y0 + oy,
	      x10 = x1 + ox,
	      y10 = y1 + oy,
	      x00 = (x11 + x10) / 2,
	      y00 = (y11 + y10) / 2,
	      dx = x10 - x11,
	      dy = y10 - y11,
	      d2 = dx * dx + dy * dy,
	      r = r1 - rc,
	      D = x11 * y10 - x10 * y11,
	      d = (dy < 0 ? -1 : 1) * sqrt$2(max$2(0, r * r * d2 - D * D)),
	      cx0 = (D * dy - dx * d) / d2,
	      cy0 = (-D * dx - dy * d) / d2,
	      cx1 = (D * dy + dx * d) / d2,
	      cy1 = (-D * dx + dy * d) / d2,
	      dx0 = cx0 - x00,
	      dy0 = cy0 - y00,
	      dx1 = cx1 - x00,
	      dy1 = cy1 - y00;

	  // Pick the closer of the two intersection points.
	  // TODO Is there a faster way to determine which intersection to use?
	  if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;

	  return {
	    cx: cx0,
	    cy: cy0,
	    x01: -ox,
	    y01: -oy,
	    x11: cx0 * (r1 / r - 1),
	    y11: cy0 * (r1 / r - 1)
	  };
	}

	var arc = function() {
	  var innerRadius = arcInnerRadius,
	      outerRadius = arcOuterRadius,
	      cornerRadius = constant$10(0),
	      padRadius = null,
	      startAngle = arcStartAngle,
	      endAngle = arcEndAngle,
	      padAngle = arcPadAngle,
	      context = null;

	  function arc() {
	    var buffer,
	        r,
	        r0 = +innerRadius.apply(this, arguments),
	        r1 = +outerRadius.apply(this, arguments),
	        a0 = startAngle.apply(this, arguments) - halfPi$3,
	        a1 = endAngle.apply(this, arguments) - halfPi$3,
	        da = abs$1(a1 - a0),
	        cw = a1 > a0;

	    if (!context) context = buffer = path();

	    // Ensure that the outer radius is always larger than the inner radius.
	    if (r1 < r0) r = r1, r1 = r0, r0 = r;

	    // Is it a point?
	    if (!(r1 > epsilon$3)) context.moveTo(0, 0);

	    // Or is it a circle or annulus?
	    else if (da > tau$4 - epsilon$3) {
	      context.moveTo(r1 * cos$2(a0), r1 * sin$2(a0));
	      context.arc(0, 0, r1, a0, a1, !cw);
	      if (r0 > epsilon$3) {
	        context.moveTo(r0 * cos$2(a1), r0 * sin$2(a1));
	        context.arc(0, 0, r0, a1, a0, cw);
	      }
	    }

	    // Or is it a circular or annular sector?
	    else {
	      var a01 = a0,
	          a11 = a1,
	          a00 = a0,
	          a10 = a1,
	          da0 = da,
	          da1 = da,
	          ap = padAngle.apply(this, arguments) / 2,
	          rp = (ap > epsilon$3) && (padRadius ? +padRadius.apply(this, arguments) : sqrt$2(r0 * r0 + r1 * r1)),
	          rc = min$1(abs$1(r1 - r0) / 2, +cornerRadius.apply(this, arguments)),
	          rc0 = rc,
	          rc1 = rc,
	          t0,
	          t1;

	      // Apply padding? Note that since r1 ≥ r0, da1 ≥ da0.
	      if (rp > epsilon$3) {
	        var p0 = asin$1(rp / r0 * sin$2(ap)),
	            p1 = asin$1(rp / r1 * sin$2(ap));
	        if ((da0 -= p0 * 2) > epsilon$3) p0 *= (cw ? 1 : -1), a00 += p0, a10 -= p0;
	        else da0 = 0, a00 = a10 = (a0 + a1) / 2;
	        if ((da1 -= p1 * 2) > epsilon$3) p1 *= (cw ? 1 : -1), a01 += p1, a11 -= p1;
	        else da1 = 0, a01 = a11 = (a0 + a1) / 2;
	      }

	      var x01 = r1 * cos$2(a01),
	          y01 = r1 * sin$2(a01),
	          x10 = r0 * cos$2(a10),
	          y10 = r0 * sin$2(a10);

	      // Apply rounded corners?
	      if (rc > epsilon$3) {
	        var x11 = r1 * cos$2(a11),
	            y11 = r1 * sin$2(a11),
	            x00 = r0 * cos$2(a00),
	            y00 = r0 * sin$2(a00);

	        // Restrict the corner radius according to the sector angle.
	        if (da < pi$4) {
	          var oc = da0 > epsilon$3 ? intersect(x01, y01, x00, y00, x11, y11, x10, y10) : [x10, y10],
	              ax = x01 - oc[0],
	              ay = y01 - oc[1],
	              bx = x11 - oc[0],
	              by = y11 - oc[1],
	              kc = 1 / sin$2(acos$1((ax * bx + ay * by) / (sqrt$2(ax * ax + ay * ay) * sqrt$2(bx * bx + by * by))) / 2),
	              lc = sqrt$2(oc[0] * oc[0] + oc[1] * oc[1]);
	          rc0 = min$1(rc, (r0 - lc) / (kc - 1));
	          rc1 = min$1(rc, (r1 - lc) / (kc + 1));
	        }
	      }

	      // Is the sector collapsed to a line?
	      if (!(da1 > epsilon$3)) context.moveTo(x01, y01);

	      // Does the sector’s outer ring have rounded corners?
	      else if (rc1 > epsilon$3) {
	        t0 = cornerTangents(x00, y00, x01, y01, r1, rc1, cw);
	        t1 = cornerTangents(x11, y11, x10, y10, r1, rc1, cw);

	        context.moveTo(t0.cx + t0.x01, t0.cy + t0.y01);

	        // Have the corners merged?
	        if (rc1 < rc) context.arc(t0.cx, t0.cy, rc1, atan2$1(t0.y01, t0.x01), atan2$1(t1.y01, t1.x01), !cw);

	        // Otherwise, draw the two corners and the ring.
	        else {
	          context.arc(t0.cx, t0.cy, rc1, atan2$1(t0.y01, t0.x01), atan2$1(t0.y11, t0.x11), !cw);
	          context.arc(0, 0, r1, atan2$1(t0.cy + t0.y11, t0.cx + t0.x11), atan2$1(t1.cy + t1.y11, t1.cx + t1.x11), !cw);
	          context.arc(t1.cx, t1.cy, rc1, atan2$1(t1.y11, t1.x11), atan2$1(t1.y01, t1.x01), !cw);
	        }
	      }

	      // Or is the outer ring just a circular arc?
	      else context.moveTo(x01, y01), context.arc(0, 0, r1, a01, a11, !cw);

	      // Is there no inner ring, and it’s a circular sector?
	      // Or perhaps it’s an annular sector collapsed due to padding?
	      if (!(r0 > epsilon$3) || !(da0 > epsilon$3)) context.lineTo(x10, y10);

	      // Does the sector’s inner ring (or point) have rounded corners?
	      else if (rc0 > epsilon$3) {
	        t0 = cornerTangents(x10, y10, x11, y11, r0, -rc0, cw);
	        t1 = cornerTangents(x01, y01, x00, y00, r0, -rc0, cw);

	        context.lineTo(t0.cx + t0.x01, t0.cy + t0.y01);

	        // Have the corners merged?
	        if (rc0 < rc) context.arc(t0.cx, t0.cy, rc0, atan2$1(t0.y01, t0.x01), atan2$1(t1.y01, t1.x01), !cw);

	        // Otherwise, draw the two corners and the ring.
	        else {
	          context.arc(t0.cx, t0.cy, rc0, atan2$1(t0.y01, t0.x01), atan2$1(t0.y11, t0.x11), !cw);
	          context.arc(0, 0, r0, atan2$1(t0.cy + t0.y11, t0.cx + t0.x11), atan2$1(t1.cy + t1.y11, t1.cx + t1.x11), cw);
	          context.arc(t1.cx, t1.cy, rc0, atan2$1(t1.y11, t1.x11), atan2$1(t1.y01, t1.x01), !cw);
	        }
	      }

	      // Or is the inner ring just a circular arc?
	      else context.arc(0, 0, r0, a10, a00, cw);
	    }

	    context.closePath();

	    if (buffer) return context = null, buffer + "" || null;
	  }

	  arc.centroid = function() {
	    var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2,
	        a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - pi$4 / 2;
	    return [cos$2(a) * r, sin$2(a) * r];
	  };

	  arc.innerRadius = function(_) {
	    return arguments.length ? (innerRadius = typeof _ === "function" ? _ : constant$10(+_), arc) : innerRadius;
	  };

	  arc.outerRadius = function(_) {
	    return arguments.length ? (outerRadius = typeof _ === "function" ? _ : constant$10(+_), arc) : outerRadius;
	  };

	  arc.cornerRadius = function(_) {
	    return arguments.length ? (cornerRadius = typeof _ === "function" ? _ : constant$10(+_), arc) : cornerRadius;
	  };

	  arc.padRadius = function(_) {
	    return arguments.length ? (padRadius = _ == null ? null : typeof _ === "function" ? _ : constant$10(+_), arc) : padRadius;
	  };

	  arc.startAngle = function(_) {
	    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant$10(+_), arc) : startAngle;
	  };

	  arc.endAngle = function(_) {
	    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant$10(+_), arc) : endAngle;
	  };

	  arc.padAngle = function(_) {
	    return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant$10(+_), arc) : padAngle;
	  };

	  arc.context = function(_) {
	    return arguments.length ? ((context = _ == null ? null : _), arc) : context;
	  };

	  return arc;
	};

	function Linear(context) {
	  this._context = context;
	}

	Linear.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
	    this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
	      case 1: this._point = 2; // proceed
	      default: this._context.lineTo(x, y); break;
	    }
	  }
	};

	var curveLinear = function(context) {
	  return new Linear(context);
	};

	function x$3(p) {
	  return p[0];
	}

	function y$3(p) {
	  return p[1];
	}

	var line = function() {
	  var x$$1 = x$3,
	      y$$1 = y$3,
	      defined = constant$10(true),
	      context = null,
	      curve = curveLinear,
	      output = null;

	  function line(data) {
	    var i,
	        n = data.length,
	        d,
	        defined0 = false,
	        buffer;

	    if (context == null) output = curve(buffer = path());

	    for (i = 0; i <= n; ++i) {
	      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
	        if (defined0 = !defined0) output.lineStart();
	        else output.lineEnd();
	      }
	      if (defined0) output.point(+x$$1(d, i, data), +y$$1(d, i, data));
	    }

	    if (buffer) return output = null, buffer + "" || null;
	  }

	  line.x = function(_) {
	    return arguments.length ? (x$$1 = typeof _ === "function" ? _ : constant$10(+_), line) : x$$1;
	  };

	  line.y = function(_) {
	    return arguments.length ? (y$$1 = typeof _ === "function" ? _ : constant$10(+_), line) : y$$1;
	  };

	  line.defined = function(_) {
	    return arguments.length ? (defined = typeof _ === "function" ? _ : constant$10(!!_), line) : defined;
	  };

	  line.curve = function(_) {
	    return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
	  };

	  line.context = function(_) {
	    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
	  };

	  return line;
	};

	var area$2 = function() {
	  var x0 = x$3,
	      x1 = null,
	      y0 = constant$10(0),
	      y1 = y$3,
	      defined = constant$10(true),
	      context = null,
	      curve = curveLinear,
	      output = null;

	  function area(data) {
	    var i,
	        j,
	        k,
	        n = data.length,
	        d,
	        defined0 = false,
	        buffer,
	        x0z = new Array(n),
	        y0z = new Array(n);

	    if (context == null) output = curve(buffer = path());

	    for (i = 0; i <= n; ++i) {
	      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
	        if (defined0 = !defined0) {
	          j = i;
	          output.areaStart();
	          output.lineStart();
	        } else {
	          output.lineEnd();
	          output.lineStart();
	          for (k = i - 1; k >= j; --k) {
	            output.point(x0z[k], y0z[k]);
	          }
	          output.lineEnd();
	          output.areaEnd();
	        }
	      }
	      if (defined0) {
	        x0z[i] = +x0(d, i, data), y0z[i] = +y0(d, i, data);
	        output.point(x1 ? +x1(d, i, data) : x0z[i], y1 ? +y1(d, i, data) : y0z[i]);
	      }
	    }

	    if (buffer) return output = null, buffer + "" || null;
	  }

	  function arealine() {
	    return line().defined(defined).curve(curve).context(context);
	  }

	  area.x = function(_) {
	    return arguments.length ? (x0 = typeof _ === "function" ? _ : constant$10(+_), x1 = null, area) : x0;
	  };

	  area.x0 = function(_) {
	    return arguments.length ? (x0 = typeof _ === "function" ? _ : constant$10(+_), area) : x0;
	  };

	  area.x1 = function(_) {
	    return arguments.length ? (x1 = _ == null ? null : typeof _ === "function" ? _ : constant$10(+_), area) : x1;
	  };

	  area.y = function(_) {
	    return arguments.length ? (y0 = typeof _ === "function" ? _ : constant$10(+_), y1 = null, area) : y0;
	  };

	  area.y0 = function(_) {
	    return arguments.length ? (y0 = typeof _ === "function" ? _ : constant$10(+_), area) : y0;
	  };

	  area.y1 = function(_) {
	    return arguments.length ? (y1 = _ == null ? null : typeof _ === "function" ? _ : constant$10(+_), area) : y1;
	  };

	  area.lineX0 =
	  area.lineY0 = function() {
	    return arealine().x(x0).y(y0);
	  };

	  area.lineY1 = function() {
	    return arealine().x(x0).y(y1);
	  };

	  area.lineX1 = function() {
	    return arealine().x(x1).y(y0);
	  };

	  area.defined = function(_) {
	    return arguments.length ? (defined = typeof _ === "function" ? _ : constant$10(!!_), area) : defined;
	  };

	  area.curve = function(_) {
	    return arguments.length ? (curve = _, context != null && (output = curve(context)), area) : curve;
	  };

	  area.context = function(_) {
	    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), area) : context;
	  };

	  return area;
	};

	var descending$1 = function(a, b) {
	  return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
	};

	var identity$7 = function(d) {
	  return d;
	};

	var pie = function() {
	  var value = identity$7,
	      sortValues = descending$1,
	      sort = null,
	      startAngle = constant$10(0),
	      endAngle = constant$10(tau$4),
	      padAngle = constant$10(0);

	  function pie(data) {
	    var i,
	        n = data.length,
	        j,
	        k,
	        sum = 0,
	        index = new Array(n),
	        arcs = new Array(n),
	        a0 = +startAngle.apply(this, arguments),
	        da = Math.min(tau$4, Math.max(-tau$4, endAngle.apply(this, arguments) - a0)),
	        a1,
	        p = Math.min(Math.abs(da) / n, padAngle.apply(this, arguments)),
	        pa = p * (da < 0 ? -1 : 1),
	        v;

	    for (i = 0; i < n; ++i) {
	      if ((v = arcs[index[i] = i] = +value(data[i], i, data)) > 0) {
	        sum += v;
	      }
	    }

	    // Optionally sort the arcs by previously-computed values or by data.
	    if (sortValues != null) index.sort(function(i, j) { return sortValues(arcs[i], arcs[j]); });
	    else if (sort != null) index.sort(function(i, j) { return sort(data[i], data[j]); });

	    // Compute the arcs! They are stored in the original data's order.
	    for (i = 0, k = sum ? (da - n * pa) / sum : 0; i < n; ++i, a0 = a1) {
	      j = index[i], v = arcs[j], a1 = a0 + (v > 0 ? v * k : 0) + pa, arcs[j] = {
	        data: data[j],
	        index: i,
	        value: v,
	        startAngle: a0,
	        endAngle: a1,
	        padAngle: p
	      };
	    }

	    return arcs;
	  }

	  pie.value = function(_) {
	    return arguments.length ? (value = typeof _ === "function" ? _ : constant$10(+_), pie) : value;
	  };

	  pie.sortValues = function(_) {
	    return arguments.length ? (sortValues = _, sort = null, pie) : sortValues;
	  };

	  pie.sort = function(_) {
	    return arguments.length ? (sort = _, sortValues = null, pie) : sort;
	  };

	  pie.startAngle = function(_) {
	    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant$10(+_), pie) : startAngle;
	  };

	  pie.endAngle = function(_) {
	    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant$10(+_), pie) : endAngle;
	  };

	  pie.padAngle = function(_) {
	    return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant$10(+_), pie) : padAngle;
	  };

	  return pie;
	};

	var curveRadialLinear = curveRadial(curveLinear);

	function Radial(curve) {
	  this._curve = curve;
	}

	Radial.prototype = {
	  areaStart: function() {
	    this._curve.areaStart();
	  },
	  areaEnd: function() {
	    this._curve.areaEnd();
	  },
	  lineStart: function() {
	    this._curve.lineStart();
	  },
	  lineEnd: function() {
	    this._curve.lineEnd();
	  },
	  point: function(a, r) {
	    this._curve.point(r * Math.sin(a), r * -Math.cos(a));
	  }
	};

	function curveRadial(curve) {

	  function radial(context) {
	    return new Radial(curve(context));
	  }

	  radial._curve = curve;

	  return radial;
	}

	function radialLine(l) {
	  var c = l.curve;

	  l.angle = l.x, delete l.x;
	  l.radius = l.y, delete l.y;

	  l.curve = function(_) {
	    return arguments.length ? c(curveRadial(_)) : c()._curve;
	  };

	  return l;
	}

	var radialLine$1 = function() {
	  return radialLine(line().curve(curveRadialLinear));
	};

	var radialArea = function() {
	  var a = area$2().curve(curveRadialLinear),
	      c = a.curve,
	      x0 = a.lineX0,
	      x1 = a.lineX1,
	      y0 = a.lineY0,
	      y1 = a.lineY1;

	  a.angle = a.x, delete a.x;
	  a.startAngle = a.x0, delete a.x0;
	  a.endAngle = a.x1, delete a.x1;
	  a.radius = a.y, delete a.y;
	  a.innerRadius = a.y0, delete a.y0;
	  a.outerRadius = a.y1, delete a.y1;
	  a.lineStartAngle = function() { return radialLine(x0()); }, delete a.lineX0;
	  a.lineEndAngle = function() { return radialLine(x1()); }, delete a.lineX1;
	  a.lineInnerRadius = function() { return radialLine(y0()); }, delete a.lineY0;
	  a.lineOuterRadius = function() { return radialLine(y1()); }, delete a.lineY1;

	  a.curve = function(_) {
	    return arguments.length ? c(curveRadial(_)) : c()._curve;
	  };

	  return a;
	};

	var circle$2 = {
	  draw: function(context, size) {
	    var r = Math.sqrt(size / pi$4);
	    context.moveTo(r, 0);
	    context.arc(0, 0, r, 0, tau$4);
	  }
	};

	var cross$2 = {
	  draw: function(context, size) {
	    var r = Math.sqrt(size / 5) / 2;
	    context.moveTo(-3 * r, -r);
	    context.lineTo(-r, -r);
	    context.lineTo(-r, -3 * r);
	    context.lineTo(r, -3 * r);
	    context.lineTo(r, -r);
	    context.lineTo(3 * r, -r);
	    context.lineTo(3 * r, r);
	    context.lineTo(r, r);
	    context.lineTo(r, 3 * r);
	    context.lineTo(-r, 3 * r);
	    context.lineTo(-r, r);
	    context.lineTo(-3 * r, r);
	    context.closePath();
	  }
	};

	var tan30 = Math.sqrt(1 / 3);
	var tan30_2 = tan30 * 2;

	var diamond = {
	  draw: function(context, size) {
	    var y = Math.sqrt(size / tan30_2),
	        x = y * tan30;
	    context.moveTo(0, -y);
	    context.lineTo(x, 0);
	    context.lineTo(0, y);
	    context.lineTo(-x, 0);
	    context.closePath();
	  }
	};

	var ka = 0.89081309152928522810;
	var kr = Math.sin(pi$4 / 10) / Math.sin(7 * pi$4 / 10);
	var kx = Math.sin(tau$4 / 10) * kr;
	var ky = -Math.cos(tau$4 / 10) * kr;

	var star = {
	  draw: function(context, size) {
	    var r = Math.sqrt(size * ka),
	        x = kx * r,
	        y = ky * r;
	    context.moveTo(0, -r);
	    context.lineTo(x, y);
	    for (var i = 1; i < 5; ++i) {
	      var a = tau$4 * i / 5,
	          c = Math.cos(a),
	          s = Math.sin(a);
	      context.lineTo(s * r, -c * r);
	      context.lineTo(c * x - s * y, s * x + c * y);
	    }
	    context.closePath();
	  }
	};

	var square = {
	  draw: function(context, size) {
	    var w = Math.sqrt(size),
	        x = -w / 2;
	    context.rect(x, x, w, w);
	  }
	};

	var sqrt3 = Math.sqrt(3);

	var triangle = {
	  draw: function(context, size) {
	    var y = -Math.sqrt(size / (sqrt3 * 3));
	    context.moveTo(0, y * 2);
	    context.lineTo(-sqrt3 * y, -y);
	    context.lineTo(sqrt3 * y, -y);
	    context.closePath();
	  }
	};

	var c = -0.5;
	var s = Math.sqrt(3) / 2;
	var k = 1 / Math.sqrt(12);
	var a = (k / 2 + 1) * 3;

	var wye = {
	  draw: function(context, size) {
	    var r = Math.sqrt(size / a),
	        x0 = r / 2,
	        y0 = r * k,
	        x1 = x0,
	        y1 = r * k + r,
	        x2 = -x1,
	        y2 = y1;
	    context.moveTo(x0, y0);
	    context.lineTo(x1, y1);
	    context.lineTo(x2, y2);
	    context.lineTo(c * x0 - s * y0, s * x0 + c * y0);
	    context.lineTo(c * x1 - s * y1, s * x1 + c * y1);
	    context.lineTo(c * x2 - s * y2, s * x2 + c * y2);
	    context.lineTo(c * x0 + s * y0, c * y0 - s * x0);
	    context.lineTo(c * x1 + s * y1, c * y1 - s * x1);
	    context.lineTo(c * x2 + s * y2, c * y2 - s * x2);
	    context.closePath();
	  }
	};

	var symbols = [
	  circle$2,
	  cross$2,
	  diamond,
	  square,
	  star,
	  triangle,
	  wye
	];

	var symbol = function() {
	  var type = constant$10(circle$2),
	      size = constant$10(64),
	      context = null;

	  function symbol() {
	    var buffer;
	    if (!context) context = buffer = path();
	    type.apply(this, arguments).draw(context, +size.apply(this, arguments));
	    if (buffer) return context = null, buffer + "" || null;
	  }

	  symbol.type = function(_) {
	    return arguments.length ? (type = typeof _ === "function" ? _ : constant$10(_), symbol) : type;
	  };

	  symbol.size = function(_) {
	    return arguments.length ? (size = typeof _ === "function" ? _ : constant$10(+_), symbol) : size;
	  };

	  symbol.context = function(_) {
	    return arguments.length ? (context = _ == null ? null : _, symbol) : context;
	  };

	  return symbol;
	};

	var noop$2 = function() {};

	function point$2(that, x, y) {
	  that._context.bezierCurveTo(
	    (2 * that._x0 + that._x1) / 3,
	    (2 * that._y0 + that._y1) / 3,
	    (that._x0 + 2 * that._x1) / 3,
	    (that._y0 + 2 * that._y1) / 3,
	    (that._x0 + 4 * that._x1 + x) / 6,
	    (that._y0 + 4 * that._y1 + y) / 6
	  );
	}

	function Basis(context) {
	  this._context = context;
	}

	Basis.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x0 = this._x1 =
	    this._y0 = this._y1 = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    switch (this._point) {
	      case 3: point$2(this, this._x1, this._y1); // proceed
	      case 2: this._context.lineTo(this._x1, this._y1); break;
	    }
	    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
	    this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
	      case 1: this._point = 2; break;
	      case 2: this._point = 3; this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6); // proceed
	      default: point$2(this, x, y); break;
	    }
	    this._x0 = this._x1, this._x1 = x;
	    this._y0 = this._y1, this._y1 = y;
	  }
	};

	var basis$2 = function(context) {
	  return new Basis(context);
	};

	function BasisClosed(context) {
	  this._context = context;
	}

	BasisClosed.prototype = {
	  areaStart: noop$2,
	  areaEnd: noop$2,
	  lineStart: function() {
	    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 =
	    this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    switch (this._point) {
	      case 1: {
	        this._context.moveTo(this._x2, this._y2);
	        this._context.closePath();
	        break;
	      }
	      case 2: {
	        this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3);
	        this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3);
	        this._context.closePath();
	        break;
	      }
	      case 3: {
	        this.point(this._x2, this._y2);
	        this.point(this._x3, this._y3);
	        this.point(this._x4, this._y4);
	        break;
	      }
	    }
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; this._x2 = x, this._y2 = y; break;
	      case 1: this._point = 2; this._x3 = x, this._y3 = y; break;
	      case 2: this._point = 3; this._x4 = x, this._y4 = y; this._context.moveTo((this._x0 + 4 * this._x1 + x) / 6, (this._y0 + 4 * this._y1 + y) / 6); break;
	      default: point$2(this, x, y); break;
	    }
	    this._x0 = this._x1, this._x1 = x;
	    this._y0 = this._y1, this._y1 = y;
	  }
	};

	var basisClosed$1 = function(context) {
	  return new BasisClosed(context);
	};

	function BasisOpen(context) {
	  this._context = context;
	}

	BasisOpen.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x0 = this._x1 =
	    this._y0 = this._y1 = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (this._line || (this._line !== 0 && this._point === 3)) this._context.closePath();
	    this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; break;
	      case 1: this._point = 2; break;
	      case 2: this._point = 3; var x0 = (this._x0 + 4 * this._x1 + x) / 6, y0 = (this._y0 + 4 * this._y1 + y) / 6; this._line ? this._context.lineTo(x0, y0) : this._context.moveTo(x0, y0); break;
	      case 3: this._point = 4; // proceed
	      default: point$2(this, x, y); break;
	    }
	    this._x0 = this._x1, this._x1 = x;
	    this._y0 = this._y1, this._y1 = y;
	  }
	};

	var basisOpen = function(context) {
	  return new BasisOpen(context);
	};

	function Bundle(context, beta) {
	  this._basis = new Basis(context);
	  this._beta = beta;
	}

	Bundle.prototype = {
	  lineStart: function() {
	    this._x = [];
	    this._y = [];
	    this._basis.lineStart();
	  },
	  lineEnd: function() {
	    var x = this._x,
	        y = this._y,
	        j = x.length - 1;

	    if (j > 0) {
	      var x0 = x[0],
	          y0 = y[0],
	          dx = x[j] - x0,
	          dy = y[j] - y0,
	          i = -1,
	          t;

	      while (++i <= j) {
	        t = i / j;
	        this._basis.point(
	          this._beta * x[i] + (1 - this._beta) * (x0 + t * dx),
	          this._beta * y[i] + (1 - this._beta) * (y0 + t * dy)
	        );
	      }
	    }

	    this._x = this._y = null;
	    this._basis.lineEnd();
	  },
	  point: function(x, y) {
	    this._x.push(+x);
	    this._y.push(+y);
	  }
	};

	var bundle = ((function custom(beta) {

	  function bundle(context) {
	    return beta === 1 ? new Basis(context) : new Bundle(context, beta);
	  }

	  bundle.beta = function(beta) {
	    return custom(+beta);
	  };

	  return bundle;
	}))(0.85);

	function point$3(that, x, y) {
	  that._context.bezierCurveTo(
	    that._x1 + that._k * (that._x2 - that._x0),
	    that._y1 + that._k * (that._y2 - that._y0),
	    that._x2 + that._k * (that._x1 - x),
	    that._y2 + that._k * (that._y1 - y),
	    that._x2,
	    that._y2
	  );
	}

	function Cardinal(context, tension) {
	  this._context = context;
	  this._k = (1 - tension) / 6;
	}

	Cardinal.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x0 = this._x1 = this._x2 =
	    this._y0 = this._y1 = this._y2 = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    switch (this._point) {
	      case 2: this._context.lineTo(this._x2, this._y2); break;
	      case 3: point$3(this, this._x1, this._y1); break;
	    }
	    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
	    this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
	      case 1: this._point = 2; this._x1 = x, this._y1 = y; break;
	      case 2: this._point = 3; // proceed
	      default: point$3(this, x, y); break;
	    }
	    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
	    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
	  }
	};

	var cardinal = ((function custom(tension) {

	  function cardinal(context) {
	    return new Cardinal(context, tension);
	  }

	  cardinal.tension = function(tension) {
	    return custom(+tension);
	  };

	  return cardinal;
	}))(0);

	function CardinalClosed(context, tension) {
	  this._context = context;
	  this._k = (1 - tension) / 6;
	}

	CardinalClosed.prototype = {
	  areaStart: noop$2,
	  areaEnd: noop$2,
	  lineStart: function() {
	    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 =
	    this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    switch (this._point) {
	      case 1: {
	        this._context.moveTo(this._x3, this._y3);
	        this._context.closePath();
	        break;
	      }
	      case 2: {
	        this._context.lineTo(this._x3, this._y3);
	        this._context.closePath();
	        break;
	      }
	      case 3: {
	        this.point(this._x3, this._y3);
	        this.point(this._x4, this._y4);
	        this.point(this._x5, this._y5);
	        break;
	      }
	    }
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; this._x3 = x, this._y3 = y; break;
	      case 1: this._point = 2; this._context.moveTo(this._x4 = x, this._y4 = y); break;
	      case 2: this._point = 3; this._x5 = x, this._y5 = y; break;
	      default: point$3(this, x, y); break;
	    }
	    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
	    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
	  }
	};

	var cardinalClosed = ((function custom(tension) {

	  function cardinal(context) {
	    return new CardinalClosed(context, tension);
	  }

	  cardinal.tension = function(tension) {
	    return custom(+tension);
	  };

	  return cardinal;
	}))(0);

	function CardinalOpen(context, tension) {
	  this._context = context;
	  this._k = (1 - tension) / 6;
	}

	CardinalOpen.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x0 = this._x1 = this._x2 =
	    this._y0 = this._y1 = this._y2 = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (this._line || (this._line !== 0 && this._point === 3)) this._context.closePath();
	    this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; break;
	      case 1: this._point = 2; break;
	      case 2: this._point = 3; this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2); break;
	      case 3: this._point = 4; // proceed
	      default: point$3(this, x, y); break;
	    }
	    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
	    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
	  }
	};

	var cardinalOpen = ((function custom(tension) {

	  function cardinal(context) {
	    return new CardinalOpen(context, tension);
	  }

	  cardinal.tension = function(tension) {
	    return custom(+tension);
	  };

	  return cardinal;
	}))(0);

	function point$4(that, x, y) {
	  var x1 = that._x1,
	      y1 = that._y1,
	      x2 = that._x2,
	      y2 = that._y2;

	  if (that._l01_a > epsilon$3) {
	    var a = 2 * that._l01_2a + 3 * that._l01_a * that._l12_a + that._l12_2a,
	        n = 3 * that._l01_a * (that._l01_a + that._l12_a);
	    x1 = (x1 * a - that._x0 * that._l12_2a + that._x2 * that._l01_2a) / n;
	    y1 = (y1 * a - that._y0 * that._l12_2a + that._y2 * that._l01_2a) / n;
	  }

	  if (that._l23_a > epsilon$3) {
	    var b = 2 * that._l23_2a + 3 * that._l23_a * that._l12_a + that._l12_2a,
	        m = 3 * that._l23_a * (that._l23_a + that._l12_a);
	    x2 = (x2 * b + that._x1 * that._l23_2a - x * that._l12_2a) / m;
	    y2 = (y2 * b + that._y1 * that._l23_2a - y * that._l12_2a) / m;
	  }

	  that._context.bezierCurveTo(x1, y1, x2, y2, that._x2, that._y2);
	}

	function CatmullRom(context, alpha) {
	  this._context = context;
	  this._alpha = alpha;
	}

	CatmullRom.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x0 = this._x1 = this._x2 =
	    this._y0 = this._y1 = this._y2 = NaN;
	    this._l01_a = this._l12_a = this._l23_a =
	    this._l01_2a = this._l12_2a = this._l23_2a =
	    this._point = 0;
	  },
	  lineEnd: function() {
	    switch (this._point) {
	      case 2: this._context.lineTo(this._x2, this._y2); break;
	      case 3: this.point(this._x2, this._y2); break;
	    }
	    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
	    this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    x = +x, y = +y;

	    if (this._point) {
	      var x23 = this._x2 - x,
	          y23 = this._y2 - y;
	      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
	    }

	    switch (this._point) {
	      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
	      case 1: this._point = 2; break;
	      case 2: this._point = 3; // proceed
	      default: point$4(this, x, y); break;
	    }

	    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
	    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
	    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
	    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
	  }
	};

	var catmullRom = ((function custom(alpha) {

	  function catmullRom(context) {
	    return alpha ? new CatmullRom(context, alpha) : new Cardinal(context, 0);
	  }

	  catmullRom.alpha = function(alpha) {
	    return custom(+alpha);
	  };

	  return catmullRom;
	}))(0.5);

	function CatmullRomClosed(context, alpha) {
	  this._context = context;
	  this._alpha = alpha;
	}

	CatmullRomClosed.prototype = {
	  areaStart: noop$2,
	  areaEnd: noop$2,
	  lineStart: function() {
	    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 =
	    this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN;
	    this._l01_a = this._l12_a = this._l23_a =
	    this._l01_2a = this._l12_2a = this._l23_2a =
	    this._point = 0;
	  },
	  lineEnd: function() {
	    switch (this._point) {
	      case 1: {
	        this._context.moveTo(this._x3, this._y3);
	        this._context.closePath();
	        break;
	      }
	      case 2: {
	        this._context.lineTo(this._x3, this._y3);
	        this._context.closePath();
	        break;
	      }
	      case 3: {
	        this.point(this._x3, this._y3);
	        this.point(this._x4, this._y4);
	        this.point(this._x5, this._y5);
	        break;
	      }
	    }
	  },
	  point: function(x, y) {
	    x = +x, y = +y;

	    if (this._point) {
	      var x23 = this._x2 - x,
	          y23 = this._y2 - y;
	      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
	    }

	    switch (this._point) {
	      case 0: this._point = 1; this._x3 = x, this._y3 = y; break;
	      case 1: this._point = 2; this._context.moveTo(this._x4 = x, this._y4 = y); break;
	      case 2: this._point = 3; this._x5 = x, this._y5 = y; break;
	      default: point$4(this, x, y); break;
	    }

	    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
	    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
	    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
	    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
	  }
	};

	var catmullRomClosed = ((function custom(alpha) {

	  function catmullRom(context) {
	    return alpha ? new CatmullRomClosed(context, alpha) : new CardinalClosed(context, 0);
	  }

	  catmullRom.alpha = function(alpha) {
	    return custom(+alpha);
	  };

	  return catmullRom;
	}))(0.5);

	function CatmullRomOpen(context, alpha) {
	  this._context = context;
	  this._alpha = alpha;
	}

	CatmullRomOpen.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x0 = this._x1 = this._x2 =
	    this._y0 = this._y1 = this._y2 = NaN;
	    this._l01_a = this._l12_a = this._l23_a =
	    this._l01_2a = this._l12_2a = this._l23_2a =
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (this._line || (this._line !== 0 && this._point === 3)) this._context.closePath();
	    this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    x = +x, y = +y;

	    if (this._point) {
	      var x23 = this._x2 - x,
	          y23 = this._y2 - y;
	      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
	    }

	    switch (this._point) {
	      case 0: this._point = 1; break;
	      case 1: this._point = 2; break;
	      case 2: this._point = 3; this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2); break;
	      case 3: this._point = 4; // proceed
	      default: point$4(this, x, y); break;
	    }

	    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
	    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
	    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x;
	    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y;
	  }
	};

	var catmullRomOpen = ((function custom(alpha) {

	  function catmullRom(context) {
	    return alpha ? new CatmullRomOpen(context, alpha) : new CardinalOpen(context, 0);
	  }

	  catmullRom.alpha = function(alpha) {
	    return custom(+alpha);
	  };

	  return catmullRom;
	}))(0.5);

	function LinearClosed(context) {
	  this._context = context;
	}

	LinearClosed.prototype = {
	  areaStart: noop$2,
	  areaEnd: noop$2,
	  lineStart: function() {
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (this._point) this._context.closePath();
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    if (this._point) this._context.lineTo(x, y);
	    else this._point = 1, this._context.moveTo(x, y);
	  }
	};

	var linearClosed = function(context) {
	  return new LinearClosed(context);
	};

	function sign$1(x) {
	  return x < 0 ? -1 : 1;
	}

	// Calculate the slopes of the tangents (Hermite-type interpolation) based on
	// the following paper: Steffen, M. 1990. A Simple Method for Monotonic
	// Interpolation in One Dimension. Astronomy and Astrophysics, Vol. 239, NO.
	// NOV(II), P. 443, 1990.
	function slope3(that, x2, y2) {
	  var h0 = that._x1 - that._x0,
	      h1 = x2 - that._x1,
	      s0 = (that._y1 - that._y0) / (h0 || h1 < 0 && -0),
	      s1 = (y2 - that._y1) / (h1 || h0 < 0 && -0),
	      p = (s0 * h1 + s1 * h0) / (h0 + h1);
	  return (sign$1(s0) + sign$1(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
	}

	// Calculate a one-sided slope.
	function slope2(that, t) {
	  var h = that._x1 - that._x0;
	  return h ? (3 * (that._y1 - that._y0) / h - t) / 2 : t;
	}

	// According to https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Representations
	// "you can express cubic Hermite interpolation in terms of cubic Bézier curves
	// with respect to the four values p0, p0 + m0 / 3, p1 - m1 / 3, p1".
	function point$5(that, t0, t1) {
	  var x0 = that._x0,
	      y0 = that._y0,
	      x1 = that._x1,
	      y1 = that._y1,
	      dx = (x1 - x0) / 3;
	  that._context.bezierCurveTo(x0 + dx, y0 + dx * t0, x1 - dx, y1 - dx * t1, x1, y1);
	}

	function MonotoneX(context) {
	  this._context = context;
	}

	MonotoneX.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x0 = this._x1 =
	    this._y0 = this._y1 =
	    this._t0 = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    switch (this._point) {
	      case 2: this._context.lineTo(this._x1, this._y1); break;
	      case 3: point$5(this, this._t0, slope2(this, this._t0)); break;
	    }
	    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
	    this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    var t1 = NaN;

	    x = +x, y = +y;
	    if (x === this._x1 && y === this._y1) return; // Ignore coincident points.
	    switch (this._point) {
	      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
	      case 1: this._point = 2; break;
	      case 2: this._point = 3; point$5(this, slope2(this, t1 = slope3(this, x, y)), t1); break;
	      default: point$5(this, this._t0, t1 = slope3(this, x, y)); break;
	    }

	    this._x0 = this._x1, this._x1 = x;
	    this._y0 = this._y1, this._y1 = y;
	    this._t0 = t1;
	  }
	};

	function MonotoneY(context) {
	  this._context = new ReflectContext(context);
	}

	(MonotoneY.prototype = Object.create(MonotoneX.prototype)).point = function(x, y) {
	  MonotoneX.prototype.point.call(this, y, x);
	};

	function ReflectContext(context) {
	  this._context = context;
	}

	ReflectContext.prototype = {
	  moveTo: function(x, y) { this._context.moveTo(y, x); },
	  closePath: function() { this._context.closePath(); },
	  lineTo: function(x, y) { this._context.lineTo(y, x); },
	  bezierCurveTo: function(x1, y1, x2, y2, x, y) { this._context.bezierCurveTo(y1, x1, y2, x2, y, x); }
	};

	function monotoneX(context) {
	  return new MonotoneX(context);
	}

	function monotoneY(context) {
	  return new MonotoneY(context);
	}

	function Natural(context) {
	  this._context = context;
	}

	Natural.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x = [];
	    this._y = [];
	  },
	  lineEnd: function() {
	    var x = this._x,
	        y = this._y,
	        n = x.length;

	    if (n) {
	      this._line ? this._context.lineTo(x[0], y[0]) : this._context.moveTo(x[0], y[0]);
	      if (n === 2) {
	        this._context.lineTo(x[1], y[1]);
	      } else {
	        var px = controlPoints(x),
	            py = controlPoints(y);
	        for (var i0 = 0, i1 = 1; i1 < n; ++i0, ++i1) {
	          this._context.bezierCurveTo(px[0][i0], py[0][i0], px[1][i0], py[1][i0], x[i1], y[i1]);
	        }
	      }
	    }

	    if (this._line || (this._line !== 0 && n === 1)) this._context.closePath();
	    this._line = 1 - this._line;
	    this._x = this._y = null;
	  },
	  point: function(x, y) {
	    this._x.push(+x);
	    this._y.push(+y);
	  }
	};

	// See https://www.particleincell.com/2012/bezier-splines/ for derivation.
	function controlPoints(x) {
	  var i,
	      n = x.length - 1,
	      m,
	      a = new Array(n),
	      b = new Array(n),
	      r = new Array(n);
	  a[0] = 0, b[0] = 2, r[0] = x[0] + 2 * x[1];
	  for (i = 1; i < n - 1; ++i) a[i] = 1, b[i] = 4, r[i] = 4 * x[i] + 2 * x[i + 1];
	  a[n - 1] = 2, b[n - 1] = 7, r[n - 1] = 8 * x[n - 1] + x[n];
	  for (i = 1; i < n; ++i) m = a[i] / b[i - 1], b[i] -= m, r[i] -= m * r[i - 1];
	  a[n - 1] = r[n - 1] / b[n - 1];
	  for (i = n - 2; i >= 0; --i) a[i] = (r[i] - a[i + 1]) / b[i];
	  b[n - 1] = (x[n] + a[n - 1]) / 2;
	  for (i = 0; i < n - 1; ++i) b[i] = 2 * x[i + 1] - a[i + 1];
	  return [a, b];
	}

	var natural = function(context) {
	  return new Natural(context);
	};

	function Step(context, t) {
	  this._context = context;
	  this._t = t;
	}

	Step.prototype = {
	  areaStart: function() {
	    this._line = 0;
	  },
	  areaEnd: function() {
	    this._line = NaN;
	  },
	  lineStart: function() {
	    this._x = this._y = NaN;
	    this._point = 0;
	  },
	  lineEnd: function() {
	    if (0 < this._t && this._t < 1 && this._point === 2) this._context.lineTo(this._x, this._y);
	    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
	    if (this._line >= 0) this._t = 1 - this._t, this._line = 1 - this._line;
	  },
	  point: function(x, y) {
	    x = +x, y = +y;
	    switch (this._point) {
	      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
	      case 1: this._point = 2; // proceed
	      default: {
	        if (this._t <= 0) {
	          this._context.lineTo(this._x, y);
	          this._context.lineTo(x, y);
	        } else {
	          var x1 = this._x * (1 - this._t) + x * this._t;
	          this._context.lineTo(x1, this._y);
	          this._context.lineTo(x1, y);
	        }
	        break;
	      }
	    }
	    this._x = x, this._y = y;
	  }
	};

	var step = function(context) {
	  return new Step(context, 0.5);
	};

	function stepBefore(context) {
	  return new Step(context, 0);
	}

	function stepAfter(context) {
	  return new Step(context, 1);
	}

	var slice$5 = Array.prototype.slice;

	var none$1 = function(series, order) {
	  if (!((n = series.length) > 1)) return;
	  for (var i = 1, s0, s1 = series[order[0]], n, m = s1.length; i < n; ++i) {
	    s0 = s1, s1 = series[order[i]];
	    for (var j = 0; j < m; ++j) {
	      s1[j][1] += s1[j][0] = isNaN(s0[j][1]) ? s0[j][0] : s0[j][1];
	    }
	  }
	};

	var none$2 = function(series) {
	  var n = series.length, o = new Array(n);
	  while (--n >= 0) o[n] = n;
	  return o;
	};

	function stackValue(d, key) {
	  return d[key];
	}

	var stack = function() {
	  var keys = constant$10([]),
	      order = none$2,
	      offset = none$1,
	      value = stackValue;

	  function stack(data) {
	    var kz = keys.apply(this, arguments),
	        i,
	        m = data.length,
	        n = kz.length,
	        sz = new Array(n),
	        oz;

	    for (i = 0; i < n; ++i) {
	      for (var ki = kz[i], si = sz[i] = new Array(m), j = 0, sij; j < m; ++j) {
	        si[j] = sij = [0, +value(data[j], ki, j, data)];
	        sij.data = data[j];
	      }
	      si.key = ki;
	    }

	    for (i = 0, oz = order(sz); i < n; ++i) {
	      sz[oz[i]].index = i;
	    }

	    offset(sz, oz);
	    return sz;
	  }

	  stack.keys = function(_) {
	    return arguments.length ? (keys = typeof _ === "function" ? _ : constant$10(slice$5.call(_)), stack) : keys;
	  };

	  stack.value = function(_) {
	    return arguments.length ? (value = typeof _ === "function" ? _ : constant$10(+_), stack) : value;
	  };

	  stack.order = function(_) {
	    return arguments.length ? (order = _ == null ? none$2 : typeof _ === "function" ? _ : constant$10(slice$5.call(_)), stack) : order;
	  };

	  stack.offset = function(_) {
	    return arguments.length ? (offset = _ == null ? none$1 : _, stack) : offset;
	  };

	  return stack;
	};

	var expand = function(series, order) {
	  if (!((n = series.length) > 0)) return;
	  for (var i, n, j = 0, m = series[0].length, y; j < m; ++j) {
	    for (y = i = 0; i < n; ++i) y += series[i][j][1] || 0;
	    if (y) for (i = 0; i < n; ++i) series[i][j][1] /= y;
	  }
	  none$1(series, order);
	};

	var silhouette = function(series, order) {
	  if (!((n = series.length) > 0)) return;
	  for (var j = 0, s0 = series[order[0]], n, m = s0.length; j < m; ++j) {
	    for (var i = 0, y = 0; i < n; ++i) y += series[i][j][1] || 0;
	    s0[j][1] += s0[j][0] = -y / 2;
	  }
	  none$1(series, order);
	};

	var wiggle = function(series, order) {
	  if (!((n = series.length) > 0) || !((m = (s0 = series[order[0]]).length) > 0)) return;
	  for (var y = 0, j = 1, s0, m, n; j < m; ++j) {
	    for (var i = 0, s1 = 0, s2 = 0; i < n; ++i) {
	      var si = series[order[i]],
	          sij0 = si[j][1] || 0,
	          sij1 = si[j - 1][1] || 0,
	          s3 = (sij0 - sij1) / 2;
	      for (var k = 0; k < i; ++k) {
	        var sk = series[order[k]],
	            skj0 = sk[j][1] || 0,
	            skj1 = sk[j - 1][1] || 0;
	        s3 += skj0 - skj1;
	      }
	      s1 += sij0, s2 += s3 * sij0;
	    }
	    s0[j - 1][1] += s0[j - 1][0] = y;
	    if (s1) y -= s2 / s1;
	  }
	  s0[j - 1][1] += s0[j - 1][0] = y;
	  none$1(series, order);
	};

	var ascending$2 = function(series) {
	  var sums = series.map(sum$2);
	  return none$2(series).sort(function(a, b) { return sums[a] - sums[b]; });
	};

	function sum$2(series) {
	  var s = 0, i = -1, n = series.length, v;
	  while (++i < n) if (v = +series[i][1]) s += v;
	  return s;
	}

	var descending$2 = function(series) {
	  return ascending$2(series).reverse();
	};

	var insideOut = function(series) {
	  var n = series.length,
	      i,
	      j,
	      sums = series.map(sum$2),
	      order = none$2(series).sort(function(a, b) { return sums[b] - sums[a]; }),
	      top = 0,
	      bottom = 0,
	      tops = [],
	      bottoms = [];

	  for (i = 0; i < n; ++i) {
	    j = order[i];
	    if (top < bottom) {
	      top += sums[j];
	      tops.push(j);
	    } else {
	      bottom += sums[j];
	      bottoms.push(j);
	    }
	  }

	  return bottoms.reverse().concat(tops);
	};

	var reverse = function(series) {
	  return none$2(series).reverse();
	};

	var constant$11 = function(x) {
	  return function() {
	    return x;
	  };
	};

	function x$4(d) {
	  return d[0];
	}

	function y$4(d) {
	  return d[1];
	}

	function RedBlackTree() {
	  this._ = null; // root node
	}

	function RedBlackNode(node) {
	  node.U = // parent node
	  node.C = // color - true for red, false for black
	  node.L = // left node
	  node.R = // right node
	  node.P = // previous node
	  node.N = null; // next node
	}

	RedBlackTree.prototype = {
	  constructor: RedBlackTree,

	  insert: function(after, node) {
	    var parent, grandpa, uncle;

	    if (after) {
	      node.P = after;
	      node.N = after.N;
	      if (after.N) after.N.P = node;
	      after.N = node;
	      if (after.R) {
	        after = after.R;
	        while (after.L) after = after.L;
	        after.L = node;
	      } else {
	        after.R = node;
	      }
	      parent = after;
	    } else if (this._) {
	      after = RedBlackFirst(this._);
	      node.P = null;
	      node.N = after;
	      after.P = after.L = node;
	      parent = after;
	    } else {
	      node.P = node.N = null;
	      this._ = node;
	      parent = null;
	    }
	    node.L = node.R = null;
	    node.U = parent;
	    node.C = true;

	    after = node;
	    while (parent && parent.C) {
	      grandpa = parent.U;
	      if (parent === grandpa.L) {
	        uncle = grandpa.R;
	        if (uncle && uncle.C) {
	          parent.C = uncle.C = false;
	          grandpa.C = true;
	          after = grandpa;
	        } else {
	          if (after === parent.R) {
	            RedBlackRotateLeft(this, parent);
	            after = parent;
	            parent = after.U;
	          }
	          parent.C = false;
	          grandpa.C = true;
	          RedBlackRotateRight(this, grandpa);
	        }
	      } else {
	        uncle = grandpa.L;
	        if (uncle && uncle.C) {
	          parent.C = uncle.C = false;
	          grandpa.C = true;
	          after = grandpa;
	        } else {
	          if (after === parent.L) {
	            RedBlackRotateRight(this, parent);
	            after = parent;
	            parent = after.U;
	          }
	          parent.C = false;
	          grandpa.C = true;
	          RedBlackRotateLeft(this, grandpa);
	        }
	      }
	      parent = after.U;
	    }
	    this._.C = false;
	  },

	  remove: function(node) {
	    if (node.N) node.N.P = node.P;
	    if (node.P) node.P.N = node.N;
	    node.N = node.P = null;

	    var parent = node.U,
	        sibling,
	        left = node.L,
	        right = node.R,
	        next,
	        red;

	    if (!left) next = right;
	    else if (!right) next = left;
	    else next = RedBlackFirst(right);

	    if (parent) {
	      if (parent.L === node) parent.L = next;
	      else parent.R = next;
	    } else {
	      this._ = next;
	    }

	    if (left && right) {
	      red = next.C;
	      next.C = node.C;
	      next.L = left;
	      left.U = next;
	      if (next !== right) {
	        parent = next.U;
	        next.U = node.U;
	        node = next.R;
	        parent.L = node;
	        next.R = right;
	        right.U = next;
	      } else {
	        next.U = parent;
	        parent = next;
	        node = next.R;
	      }
	    } else {
	      red = node.C;
	      node = next;
	    }

	    if (node) node.U = parent;
	    if (red) return;
	    if (node && node.C) { node.C = false; return; }

	    do {
	      if (node === this._) break;
	      if (node === parent.L) {
	        sibling = parent.R;
	        if (sibling.C) {
	          sibling.C = false;
	          parent.C = true;
	          RedBlackRotateLeft(this, parent);
	          sibling = parent.R;
	        }
	        if ((sibling.L && sibling.L.C)
	            || (sibling.R && sibling.R.C)) {
	          if (!sibling.R || !sibling.R.C) {
	            sibling.L.C = false;
	            sibling.C = true;
	            RedBlackRotateRight(this, sibling);
	            sibling = parent.R;
	          }
	          sibling.C = parent.C;
	          parent.C = sibling.R.C = false;
	          RedBlackRotateLeft(this, parent);
	          node = this._;
	          break;
	        }
	      } else {
	        sibling = parent.L;
	        if (sibling.C) {
	          sibling.C = false;
	          parent.C = true;
	          RedBlackRotateRight(this, parent);
	          sibling = parent.L;
	        }
	        if ((sibling.L && sibling.L.C)
	          || (sibling.R && sibling.R.C)) {
	          if (!sibling.L || !sibling.L.C) {
	            sibling.R.C = false;
	            sibling.C = true;
	            RedBlackRotateLeft(this, sibling);
	            sibling = parent.L;
	          }
	          sibling.C = parent.C;
	          parent.C = sibling.L.C = false;
	          RedBlackRotateRight(this, parent);
	          node = this._;
	          break;
	        }
	      }
	      sibling.C = true;
	      node = parent;
	      parent = parent.U;
	    } while (!node.C);

	    if (node) node.C = false;
	  }
	};

	function RedBlackRotateLeft(tree, node) {
	  var p = node,
	      q = node.R,
	      parent = p.U;

	  if (parent) {
	    if (parent.L === p) parent.L = q;
	    else parent.R = q;
	  } else {
	    tree._ = q;
	  }

	  q.U = parent;
	  p.U = q;
	  p.R = q.L;
	  if (p.R) p.R.U = p;
	  q.L = p;
	}

	function RedBlackRotateRight(tree, node) {
	  var p = node,
	      q = node.L,
	      parent = p.U;

	  if (parent) {
	    if (parent.L === p) parent.L = q;
	    else parent.R = q;
	  } else {
	    tree._ = q;
	  }

	  q.U = parent;
	  p.U = q;
	  p.L = q.R;
	  if (p.L) p.L.U = p;
	  q.R = p;
	}

	function RedBlackFirst(node) {
	  while (node.L) node = node.L;
	  return node;
	}

	function createEdge(left, right, v0, v1) {
	  var edge = [null, null],
	      index = edges.push(edge) - 1;
	  edge.left = left;
	  edge.right = right;
	  if (v0) setEdgeEnd(edge, left, right, v0);
	  if (v1) setEdgeEnd(edge, right, left, v1);
	  cells[left.index].halfedges.push(index);
	  cells[right.index].halfedges.push(index);
	  return edge;
	}

	function createBorderEdge(left, v0, v1) {
	  var edge = [v0, v1];
	  edge.left = left;
	  return edge;
	}

	function setEdgeEnd(edge, left, right, vertex) {
	  if (!edge[0] && !edge[1]) {
	    edge[0] = vertex;
	    edge.left = left;
	    edge.right = right;
	  } else if (edge.left === right) {
	    edge[1] = vertex;
	  } else {
	    edge[0] = vertex;
	  }
	}

	// Liang–Barsky line clipping.
	function clipEdge(edge, x0, y0, x1, y1) {
	  var a = edge[0],
	      b = edge[1],
	      ax = a[0],
	      ay = a[1],
	      bx = b[0],
	      by = b[1],
	      t0 = 0,
	      t1 = 1,
	      dx = bx - ax,
	      dy = by - ay,
	      r;

	  r = x0 - ax;
	  if (!dx && r > 0) return;
	  r /= dx;
	  if (dx < 0) {
	    if (r < t0) return;
	    if (r < t1) t1 = r;
	  } else if (dx > 0) {
	    if (r > t1) return;
	    if (r > t0) t0 = r;
	  }

	  r = x1 - ax;
	  if (!dx && r < 0) return;
	  r /= dx;
	  if (dx < 0) {
	    if (r > t1) return;
	    if (r > t0) t0 = r;
	  } else if (dx > 0) {
	    if (r < t0) return;
	    if (r < t1) t1 = r;
	  }

	  r = y0 - ay;
	  if (!dy && r > 0) return;
	  r /= dy;
	  if (dy < 0) {
	    if (r < t0) return;
	    if (r < t1) t1 = r;
	  } else if (dy > 0) {
	    if (r > t1) return;
	    if (r > t0) t0 = r;
	  }

	  r = y1 - ay;
	  if (!dy && r < 0) return;
	  r /= dy;
	  if (dy < 0) {
	    if (r > t1) return;
	    if (r > t0) t0 = r;
	  } else if (dy > 0) {
	    if (r < t0) return;
	    if (r < t1) t1 = r;
	  }

	  if (!(t0 > 0) && !(t1 < 1)) return true; // TODO Better check?

	  if (t0 > 0) edge[0] = [ax + t0 * dx, ay + t0 * dy];
	  if (t1 < 1) edge[1] = [ax + t1 * dx, ay + t1 * dy];
	  return true;
	}

	function connectEdge(edge, x0, y0, x1, y1) {
	  var v1 = edge[1];
	  if (v1) return true;

	  var v0 = edge[0],
	      left = edge.left,
	      right = edge.right,
	      lx = left[0],
	      ly = left[1],
	      rx = right[0],
	      ry = right[1],
	      fx = (lx + rx) / 2,
	      fy = (ly + ry) / 2,
	      fm,
	      fb;

	  if (ry === ly) {
	    if (fx < x0 || fx >= x1) return;
	    if (lx > rx) {
	      if (!v0) v0 = [fx, y0];
	      else if (v0[1] >= y1) return;
	      v1 = [fx, y1];
	    } else {
	      if (!v0) v0 = [fx, y1];
	      else if (v0[1] < y0) return;
	      v1 = [fx, y0];
	    }
	  } else {
	    fm = (lx - rx) / (ry - ly);
	    fb = fy - fm * fx;
	    if (fm < -1 || fm > 1) {
	      if (lx > rx) {
	        if (!v0) v0 = [(y0 - fb) / fm, y0];
	        else if (v0[1] >= y1) return;
	        v1 = [(y1 - fb) / fm, y1];
	      } else {
	        if (!v0) v0 = [(y1 - fb) / fm, y1];
	        else if (v0[1] < y0) return;
	        v1 = [(y0 - fb) / fm, y0];
	      }
	    } else {
	      if (ly < ry) {
	        if (!v0) v0 = [x0, fm * x0 + fb];
	        else if (v0[0] >= x1) return;
	        v1 = [x1, fm * x1 + fb];
	      } else {
	        if (!v0) v0 = [x1, fm * x1 + fb];
	        else if (v0[0] < x0) return;
	        v1 = [x0, fm * x0 + fb];
	      }
	    }
	  }

	  edge[0] = v0;
	  edge[1] = v1;
	  return true;
	}

	function clipEdges(x0, y0, x1, y1) {
	  var i = edges.length,
	      edge;

	  while (i--) {
	    if (!connectEdge(edge = edges[i], x0, y0, x1, y1)
	        || !clipEdge(edge, x0, y0, x1, y1)
	        || !(Math.abs(edge[0][0] - edge[1][0]) > epsilon$4
	            || Math.abs(edge[0][1] - edge[1][1]) > epsilon$4)) {
	      delete edges[i];
	    }
	  }
	}

	function createCell(site) {
	  return cells[site.index] = {
	    site: site,
	    halfedges: []
	  };
	}

	function cellHalfedgeAngle(cell, edge) {
	  var site = cell.site,
	      va = edge.left,
	      vb = edge.right;
	  if (site === vb) vb = va, va = site;
	  if (vb) return Math.atan2(vb[1] - va[1], vb[0] - va[0]);
	  if (site === va) va = edge[1], vb = edge[0];
	  else va = edge[0], vb = edge[1];
	  return Math.atan2(va[0] - vb[0], vb[1] - va[1]);
	}

	function cellHalfedgeStart(cell, edge) {
	  return edge[+(edge.left !== cell.site)];
	}

	function cellHalfedgeEnd(cell, edge) {
	  return edge[+(edge.left === cell.site)];
	}

	function sortCellHalfedges() {
	  for (var i = 0, n = cells.length, cell, halfedges, j, m; i < n; ++i) {
	    if ((cell = cells[i]) && (m = (halfedges = cell.halfedges).length)) {
	      var index = new Array(m),
	          array = new Array(m);
	      for (j = 0; j < m; ++j) index[j] = j, array[j] = cellHalfedgeAngle(cell, edges[halfedges[j]]);
	      index.sort(function(i, j) { return array[j] - array[i]; });
	      for (j = 0; j < m; ++j) array[j] = halfedges[index[j]];
	      for (j = 0; j < m; ++j) halfedges[j] = array[j];
	    }
	  }
	}

	function clipCells(x0, y0, x1, y1) {
	  var nCells = cells.length,
	      iCell,
	      cell,
	      site,
	      iHalfedge,
	      halfedges,
	      nHalfedges,
	      start,
	      startX,
	      startY,
	      end,
	      endX,
	      endY,
	      cover = true;

	  for (iCell = 0; iCell < nCells; ++iCell) {
	    if (cell = cells[iCell]) {
	      site = cell.site;
	      halfedges = cell.halfedges;
	      iHalfedge = halfedges.length;

	      // Remove any dangling clipped edges.
	      while (iHalfedge--) {
	        if (!edges[halfedges[iHalfedge]]) {
	          halfedges.splice(iHalfedge, 1);
	        }
	      }

	      // Insert any border edges as necessary.
	      iHalfedge = 0, nHalfedges = halfedges.length;
	      while (iHalfedge < nHalfedges) {
	        end = cellHalfedgeEnd(cell, edges[halfedges[iHalfedge]]), endX = end[0], endY = end[1];
	        start = cellHalfedgeStart(cell, edges[halfedges[++iHalfedge % nHalfedges]]), startX = start[0], startY = start[1];
	        if (Math.abs(endX - startX) > epsilon$4 || Math.abs(endY - startY) > epsilon$4) {
	          halfedges.splice(iHalfedge, 0, edges.push(createBorderEdge(site, end,
	              Math.abs(endX - x0) < epsilon$4 && y1 - endY > epsilon$4 ? [x0, Math.abs(startX - x0) < epsilon$4 ? startY : y1]
	              : Math.abs(endY - y1) < epsilon$4 && x1 - endX > epsilon$4 ? [Math.abs(startY - y1) < epsilon$4 ? startX : x1, y1]
	              : Math.abs(endX - x1) < epsilon$4 && endY - y0 > epsilon$4 ? [x1, Math.abs(startX - x1) < epsilon$4 ? startY : y0]
	              : Math.abs(endY - y0) < epsilon$4 && endX - x0 > epsilon$4 ? [Math.abs(startY - y0) < epsilon$4 ? startX : x0, y0]
	              : null)) - 1);
	          ++nHalfedges;
	        }
	      }

	      if (nHalfedges) cover = false;
	    }
	  }

	  // If there weren’t any edges, have the closest site cover the extent.
	  // It doesn’t matter which corner of the extent we measure!
	  if (cover) {
	    var dx, dy, d2, dc = Infinity;

	    for (iCell = 0, cover = null; iCell < nCells; ++iCell) {
	      if (cell = cells[iCell]) {
	        site = cell.site;
	        dx = site[0] - x0;
	        dy = site[1] - y0;
	        d2 = dx * dx + dy * dy;
	        if (d2 < dc) dc = d2, cover = cell;
	      }
	    }

	    if (cover) {
	      var v00 = [x0, y0], v01 = [x0, y1], v11 = [x1, y1], v10 = [x1, y0];
	      cover.halfedges.push(
	        edges.push(createBorderEdge(site = cover.site, v00, v01)) - 1,
	        edges.push(createBorderEdge(site, v01, v11)) - 1,
	        edges.push(createBorderEdge(site, v11, v10)) - 1,
	        edges.push(createBorderEdge(site, v10, v00)) - 1
	      );
	    }
	  }

	  // Lastly delete any cells with no edges; these were entirely clipped.
	  for (iCell = 0; iCell < nCells; ++iCell) {
	    if (cell = cells[iCell]) {
	      if (!cell.halfedges.length) {
	        delete cells[iCell];
	      }
	    }
	  }
	}

	var circlePool = [];

	var firstCircle;

	function Circle() {
	  RedBlackNode(this);
	  this.x =
	  this.y =
	  this.arc =
	  this.site =
	  this.cy = null;
	}

	function attachCircle(arc) {
	  var lArc = arc.P,
	      rArc = arc.N;

	  if (!lArc || !rArc) return;

	  var lSite = lArc.site,
	      cSite = arc.site,
	      rSite = rArc.site;

	  if (lSite === rSite) return;

	  var bx = cSite[0],
	      by = cSite[1],
	      ax = lSite[0] - bx,
	      ay = lSite[1] - by,
	      cx = rSite[0] - bx,
	      cy = rSite[1] - by;

	  var d = 2 * (ax * cy - ay * cx);
	  if (d >= -epsilon2$2) return;

	  var ha = ax * ax + ay * ay,
	      hc = cx * cx + cy * cy,
	      x = (cy * ha - ay * hc) / d,
	      y = (ax * hc - cx * ha) / d;

	  var circle = circlePool.pop() || new Circle;
	  circle.arc = arc;
	  circle.site = cSite;
	  circle.x = x + bx;
	  circle.y = (circle.cy = y + by) + Math.sqrt(x * x + y * y); // y bottom

	  arc.circle = circle;

	  var before = null,
	      node = circles._;

	  while (node) {
	    if (circle.y < node.y || (circle.y === node.y && circle.x <= node.x)) {
	      if (node.L) node = node.L;
	      else { before = node.P; break; }
	    } else {
	      if (node.R) node = node.R;
	      else { before = node; break; }
	    }
	  }

	  circles.insert(before, circle);
	  if (!before) firstCircle = circle;
	}

	function detachCircle(arc) {
	  var circle = arc.circle;
	  if (circle) {
	    if (!circle.P) firstCircle = circle.N;
	    circles.remove(circle);
	    circlePool.push(circle);
	    RedBlackNode(circle);
	    arc.circle = null;
	  }
	}

	var beachPool = [];

	function Beach() {
	  RedBlackNode(this);
	  this.edge =
	  this.site =
	  this.circle = null;
	}

	function createBeach(site) {
	  var beach = beachPool.pop() || new Beach;
	  beach.site = site;
	  return beach;
	}

	function detachBeach(beach) {
	  detachCircle(beach);
	  beaches.remove(beach);
	  beachPool.push(beach);
	  RedBlackNode(beach);
	}

	function removeBeach(beach) {
	  var circle = beach.circle,
	      x = circle.x,
	      y = circle.cy,
	      vertex = [x, y],
	      previous = beach.P,
	      next = beach.N,
	      disappearing = [beach];

	  detachBeach(beach);

	  var lArc = previous;
	  while (lArc.circle
	      && Math.abs(x - lArc.circle.x) < epsilon$4
	      && Math.abs(y - lArc.circle.cy) < epsilon$4) {
	    previous = lArc.P;
	    disappearing.unshift(lArc);
	    detachBeach(lArc);
	    lArc = previous;
	  }

	  disappearing.unshift(lArc);
	  detachCircle(lArc);

	  var rArc = next;
	  while (rArc.circle
	      && Math.abs(x - rArc.circle.x) < epsilon$4
	      && Math.abs(y - rArc.circle.cy) < epsilon$4) {
	    next = rArc.N;
	    disappearing.push(rArc);
	    detachBeach(rArc);
	    rArc = next;
	  }

	  disappearing.push(rArc);
	  detachCircle(rArc);

	  var nArcs = disappearing.length,
	      iArc;
	  for (iArc = 1; iArc < nArcs; ++iArc) {
	    rArc = disappearing[iArc];
	    lArc = disappearing[iArc - 1];
	    setEdgeEnd(rArc.edge, lArc.site, rArc.site, vertex);
	  }

	  lArc = disappearing[0];
	  rArc = disappearing[nArcs - 1];
	  rArc.edge = createEdge(lArc.site, rArc.site, null, vertex);

	  attachCircle(lArc);
	  attachCircle(rArc);
	}

	function addBeach(site) {
	  var x = site[0],
	      directrix = site[1],
	      lArc,
	      rArc,
	      dxl,
	      dxr,
	      node = beaches._;

	  while (node) {
	    dxl = leftBreakPoint(node, directrix) - x;
	    if (dxl > epsilon$4) node = node.L; else {
	      dxr = x - rightBreakPoint(node, directrix);
	      if (dxr > epsilon$4) {
	        if (!node.R) {
	          lArc = node;
	          break;
	        }
	        node = node.R;
	      } else {
	        if (dxl > -epsilon$4) {
	          lArc = node.P;
	          rArc = node;
	        } else if (dxr > -epsilon$4) {
	          lArc = node;
	          rArc = node.N;
	        } else {
	          lArc = rArc = node;
	        }
	        break;
	      }
	    }
	  }

	  createCell(site);
	  var newArc = createBeach(site);
	  beaches.insert(lArc, newArc);

	  if (!lArc && !rArc) return;

	  if (lArc === rArc) {
	    detachCircle(lArc);
	    rArc = createBeach(lArc.site);
	    beaches.insert(newArc, rArc);
	    newArc.edge = rArc.edge = createEdge(lArc.site, newArc.site);
	    attachCircle(lArc);
	    attachCircle(rArc);
	    return;
	  }

	  if (!rArc) { // && lArc
	    newArc.edge = createEdge(lArc.site, newArc.site);
	    return;
	  }

	  // else lArc !== rArc
	  detachCircle(lArc);
	  detachCircle(rArc);

	  var lSite = lArc.site,
	      ax = lSite[0],
	      ay = lSite[1],
	      bx = site[0] - ax,
	      by = site[1] - ay,
	      rSite = rArc.site,
	      cx = rSite[0] - ax,
	      cy = rSite[1] - ay,
	      d = 2 * (bx * cy - by * cx),
	      hb = bx * bx + by * by,
	      hc = cx * cx + cy * cy,
	      vertex = [(cy * hb - by * hc) / d + ax, (bx * hc - cx * hb) / d + ay];

	  setEdgeEnd(rArc.edge, lSite, rSite, vertex);
	  newArc.edge = createEdge(lSite, site, null, vertex);
	  rArc.edge = createEdge(site, rSite, null, vertex);
	  attachCircle(lArc);
	  attachCircle(rArc);
	}

	function leftBreakPoint(arc, directrix) {
	  var site = arc.site,
	      rfocx = site[0],
	      rfocy = site[1],
	      pby2 = rfocy - directrix;

	  if (!pby2) return rfocx;

	  var lArc = arc.P;
	  if (!lArc) return -Infinity;

	  site = lArc.site;
	  var lfocx = site[0],
	      lfocy = site[1],
	      plby2 = lfocy - directrix;

	  if (!plby2) return lfocx;

	  var hl = lfocx - rfocx,
	      aby2 = 1 / pby2 - 1 / plby2,
	      b = hl / plby2;

	  if (aby2) return (-b + Math.sqrt(b * b - 2 * aby2 * (hl * hl / (-2 * plby2) - lfocy + plby2 / 2 + rfocy - pby2 / 2))) / aby2 + rfocx;

	  return (rfocx + lfocx) / 2;
	}

	function rightBreakPoint(arc, directrix) {
	  var rArc = arc.N;
	  if (rArc) return leftBreakPoint(rArc, directrix);
	  var site = arc.site;
	  return site[1] === directrix ? site[0] : Infinity;
	}

	var epsilon$4 = 1e-6;
	var epsilon2$2 = 1e-12;
	var beaches;
	var cells;
	var circles;
	var edges;

	function triangleArea(a, b, c) {
	  return (a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1]);
	}

	function lexicographic(a, b) {
	  return b[1] - a[1]
	      || b[0] - a[0];
	}

	function Diagram(sites, extent) {
	  var site = sites.sort(lexicographic).pop(),
	      x,
	      y,
	      circle;

	  edges = [];
	  cells = new Array(sites.length);
	  beaches = new RedBlackTree;
	  circles = new RedBlackTree;

	  while (true) {
	    circle = firstCircle;
	    if (site && (!circle || site[1] < circle.y || (site[1] === circle.y && site[0] < circle.x))) {
	      if (site[0] !== x || site[1] !== y) {
	        addBeach(site);
	        x = site[0], y = site[1];
	      }
	      site = sites.pop();
	    } else if (circle) {
	      removeBeach(circle.arc);
	    } else {
	      break;
	    }
	  }

	  sortCellHalfedges();

	  if (extent) {
	    var x0 = +extent[0][0],
	        y0 = +extent[0][1],
	        x1 = +extent[1][0],
	        y1 = +extent[1][1];
	    clipEdges(x0, y0, x1, y1);
	    clipCells(x0, y0, x1, y1);
	  }

	  this.edges = edges;
	  this.cells = cells;

	  beaches =
	  circles =
	  edges =
	  cells = null;
	}

	Diagram.prototype = {
	  constructor: Diagram,

	  polygons: function() {
	    var edges = this.edges;

	    return this.cells.map(function(cell) {
	      var polygon = cell.halfedges.map(function(i) { return cellHalfedgeStart(cell, edges[i]); });
	      polygon.data = cell.site.data;
	      return polygon;
	    });
	  },

	  triangles: function() {
	    var triangles = [],
	        edges = this.edges;

	    this.cells.forEach(function(cell, i) {
	      if (!(m = (halfedges = cell.halfedges).length)) return;
	      var site = cell.site,
	          halfedges,
	          j = -1,
	          m,
	          s0,
	          e1 = edges[halfedges[m - 1]],
	          s1 = e1.left === site ? e1.right : e1.left;

	      while (++j < m) {
	        s0 = s1;
	        e1 = edges[halfedges[j]];
	        s1 = e1.left === site ? e1.right : e1.left;
	        if (s0 && s1 && i < s0.index && i < s1.index && triangleArea(site, s0, s1) < 0) {
	          triangles.push([site.data, s0.data, s1.data]);
	        }
	      }
	    });

	    return triangles;
	  },

	  links: function() {
	    return this.edges.filter(function(edge) {
	      return edge.right;
	    }).map(function(edge) {
	      return {
	        source: edge.left.data,
	        target: edge.right.data
	      };
	    });
	  },

	  find: function(x, y, radius) {
	    var that = this, i0, i1 = that._found || 0, n = that.cells.length, cell;

	    // Use the previously-found cell, or start with an arbitrary one.
	    while (!(cell = that.cells[i1])) if (++i1 >= n) return null;
	    var dx = x - cell.site[0], dy = y - cell.site[1], d2 = dx * dx + dy * dy;

	    // Traverse the half-edges to find a closer cell, if any.
	    do {
	      cell = that.cells[i0 = i1], i1 = null;
	      cell.halfedges.forEach(function(e) {
	        var edge = that.edges[e], v = edge.left;
	        if ((v === cell.site || !v) && !(v = edge.right)) return;
	        var vx = x - v[0], vy = y - v[1], v2 = vx * vx + vy * vy;
	        if (v2 < d2) d2 = v2, i1 = v.index;
	      });
	    } while (i1 !== null);

	    that._found = i0;

	    return radius == null || d2 <= radius * radius ? cell.site : null;
	  }
	};

	var voronoi = function() {
	  var x$$1 = x$4,
	      y$$1 = y$4,
	      extent = null;

	  function voronoi(data) {
	    return new Diagram(data.map(function(d, i) {
	      var s = [Math.round(x$$1(d, i, data) / epsilon$4) * epsilon$4, Math.round(y$$1(d, i, data) / epsilon$4) * epsilon$4];
	      s.index = i;
	      s.data = d;
	      return s;
	    }), extent);
	  }

	  voronoi.polygons = function(data) {
	    return voronoi(data).polygons();
	  };

	  voronoi.links = function(data) {
	    return voronoi(data).links();
	  };

	  voronoi.triangles = function(data) {
	    return voronoi(data).triangles();
	  };

	  voronoi.x = function(_) {
	    return arguments.length ? (x$$1 = typeof _ === "function" ? _ : constant$11(+_), voronoi) : x$$1;
	  };

	  voronoi.y = function(_) {
	    return arguments.length ? (y$$1 = typeof _ === "function" ? _ : constant$11(+_), voronoi) : y$$1;
	  };

	  voronoi.extent = function(_) {
	    return arguments.length ? (extent = _ == null ? null : [[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]], voronoi) : extent && [[extent[0][0], extent[0][1]], [extent[1][0], extent[1][1]]];
	  };

	  voronoi.size = function(_) {
	    return arguments.length ? (extent = _ == null ? null : [[0, 0], [+_[0], +_[1]]], voronoi) : extent && [extent[1][0] - extent[0][0], extent[1][1] - extent[0][1]];
	  };

	  return voronoi;
	};

	var constant$12 = function(x) {
	  return function() {
	    return x;
	  };
	};

	function ZoomEvent(target, type, transform) {
	  this.target = target;
	  this.type = type;
	  this.transform = transform;
	}

	function Transform(k, x, y) {
	  this.k = k;
	  this.x = x;
	  this.y = y;
	}

	Transform.prototype = {
	  constructor: Transform,
	  scale: function(k) {
	    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
	  },
	  translate: function(x, y) {
	    return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
	  },
	  apply: function(point) {
	    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
	  },
	  applyX: function(x) {
	    return x * this.k + this.x;
	  },
	  applyY: function(y) {
	    return y * this.k + this.y;
	  },
	  invert: function(location) {
	    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
	  },
	  invertX: function(x) {
	    return (x - this.x) / this.k;
	  },
	  invertY: function(y) {
	    return (y - this.y) / this.k;
	  },
	  rescaleX: function(x) {
	    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
	  },
	  rescaleY: function(y) {
	    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
	  },
	  toString: function() {
	    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
	  }
	};

	var identity$8 = new Transform(1, 0, 0);

	transform$1.prototype = Transform.prototype;

	function transform$1(node) {
	  return node.__zoom || identity$8;
	}

	function nopropagation$2() {
	  exports.event.stopImmediatePropagation();
	}

	var noevent$2 = function() {
	  exports.event.preventDefault();
	  exports.event.stopImmediatePropagation();
	};

	// Ignore right-click, since that should open the context menu.
	function defaultFilter$2() {
	  return !exports.event.button;
	}

	function defaultExtent$1() {
	  var e = this, w, h;
	  if (e instanceof SVGElement) {
	    e = e.ownerSVGElement || e;
	    w = e.width.baseVal.value;
	    h = e.height.baseVal.value;
	  } else {
	    w = e.clientWidth;
	    h = e.clientHeight;
	  }
	  return [[0, 0], [w, h]];
	}

	function defaultTransform() {
	  return this.__zoom || identity$8;
	}

	var zoom = function() {
	  var filter = defaultFilter$2,
	      extent = defaultExtent$1,
	      k0 = 0,
	      k1 = Infinity,
	      x0 = -k1,
	      x1 = k1,
	      y0 = x0,
	      y1 = x1,
	      duration = 250,
	      interpolate$$1 = interpolateZoom,
	      gestures = [],
	      listeners = dispatch("start", "zoom", "end"),
	      touchstarting,
	      touchending,
	      touchDelay = 500,
	      wheelDelay = 150;

	  function zoom(selection$$1) {
	    selection$$1
	        .on("wheel.zoom", wheeled)
	        .on("mousedown.zoom", mousedowned)
	        .on("dblclick.zoom", dblclicked)
	        .on("touchstart.zoom", touchstarted)
	        .on("touchmove.zoom", touchmoved)
	        .on("touchend.zoom touchcancel.zoom", touchended)
	        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)")
	        .property("__zoom", defaultTransform);
	  }

	  zoom.transform = function(collection, transform) {
	    var selection$$1 = collection.selection ? collection.selection() : collection;
	    selection$$1.property("__zoom", defaultTransform);
	    if (collection !== selection$$1) {
	      schedule(collection, transform);
	    } else {
	      selection$$1.interrupt().each(function() {
	        gesture(this, arguments)
	            .start()
	            .zoom(null, typeof transform === "function" ? transform.apply(this, arguments) : transform)
	            .end();
	      });
	    }
	  };

	  zoom.scaleBy = function(selection$$1, k) {
	    zoom.scaleTo(selection$$1, function() {
	      var k0 = this.__zoom.k,
	          k1 = typeof k === "function" ? k.apply(this, arguments) : k;
	      return k0 * k1;
	    });
	  };

	  zoom.scaleTo = function(selection$$1, k) {
	    zoom.transform(selection$$1, function() {
	      var e = extent.apply(this, arguments),
	          t0 = this.__zoom,
	          p0 = centroid(e),
	          p1 = t0.invert(p0),
	          k1 = typeof k === "function" ? k.apply(this, arguments) : k;
	      return constrain(translate(scale(t0, k1), p0, p1), e);
	    });
	  };

	  zoom.translateBy = function(selection$$1, x, y) {
	    zoom.transform(selection$$1, function() {
	      return constrain(this.__zoom.translate(
	        typeof x === "function" ? x.apply(this, arguments) : x,
	        typeof y === "function" ? y.apply(this, arguments) : y
	      ), extent.apply(this, arguments));
	    });
	  };

	  function scale(transform, k) {
	    k = Math.max(k0, Math.min(k1, k));
	    return k === transform.k ? transform : new Transform(k, transform.x, transform.y);
	  }

	  function translate(transform, p0, p1) {
	    var x = p0[0] - p1[0] * transform.k, y = p0[1] - p1[1] * transform.k;
	    return x === transform.x && y === transform.y ? transform : new Transform(transform.k, x, y);
	  }

	  function constrain(transform, extent) {
	    var dx0 = transform.invertX(extent[0][0]) - x0,
	        dx1 = transform.invertX(extent[1][0]) - x1,
	        dy0 = transform.invertY(extent[0][1]) - y0,
	        dy1 = transform.invertY(extent[1][1]) - y1;
	    return transform.translate(
	      dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
	      dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
	    );
	  }

	  function centroid(extent) {
	    return [(+extent[0][0] + +extent[1][0]) / 2, (+extent[0][1] + +extent[1][1]) / 2];
	  }

	  function schedule(transition$$1, transform, center) {
	    transition$$1
	        .on("start.zoom", function() { gesture(this, arguments).start(); })
	        .on("interrupt.zoom end.zoom", function() { gesture(this, arguments).end(); })
	        .tween("zoom", function() {
	          var that = this,
	              args = arguments,
	              g = gesture(that, args),
	              e = extent.apply(that, args),
	              p = center || centroid(e),
	              w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]),
	              a = that.__zoom,
	              b = typeof transform === "function" ? transform.apply(that, args) : transform,
	              i = interpolate$$1(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
	          return function(t) {
	            if (t === 1) t = b; // Avoid rounding error on end.
	            else { var l = i(t), k = w / l[2]; t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k); }
	            g.zoom(null, t);
	          };
	        });
	  }

	  function gesture(that, args) {
	    for (var i = 0, n = gestures.length, g; i < n; ++i) {
	      if ((g = gestures[i]).that === that) {
	        return g;
	      }
	    }
	    return new Gesture(that, args);
	  }

	  function Gesture(that, args) {
	    this.that = that;
	    this.args = args;
	    this.index = -1;
	    this.active = 0;
	    this.extent = extent.apply(that, args);
	  }

	  Gesture.prototype = {
	    start: function() {
	      if (++this.active === 1) {
	        this.index = gestures.push(this) - 1;
	        this.emit("start");
	      }
	      return this;
	    },
	    zoom: function(key, transform) {
	      if (this.mouse && key !== "mouse") this.mouse[1] = transform.invert(this.mouse[0]);
	      if (this.touch0 && key !== "touch") this.touch0[1] = transform.invert(this.touch0[0]);
	      if (this.touch1 && key !== "touch") this.touch1[1] = transform.invert(this.touch1[0]);
	      this.that.__zoom = transform;
	      this.emit("zoom");
	      return this;
	    },
	    end: function() {
	      if (--this.active === 0) {
	        gestures.splice(this.index, 1);
	        this.index = -1;
	        this.emit("end");
	      }
	      return this;
	    },
	    emit: function(type) {
	      customEvent(new ZoomEvent(zoom, type, this.that.__zoom), listeners.apply, listeners, [type, this.that, this.args]);
	    }
	  };

	  function wheeled() {
	    if (!filter.apply(this, arguments)) return;
	    var g = gesture(this, arguments),
	        t = this.__zoom,
	        k = Math.max(k0, Math.min(k1, t.k * Math.pow(2, -exports.event.deltaY * (exports.event.deltaMode ? 120 : 1) / 500))),
	        p = mouse(this);

	    // If the mouse is in the same location as before, reuse it.
	    // If there were recent wheel events, reset the wheel idle timeout.
	    if (g.wheel) {
	      if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
	        g.mouse[1] = t.invert(g.mouse[0] = p);
	      }
	      clearTimeout(g.wheel);
	    }

	    // If this wheel event won’t trigger a transform change, ignore it.
	    else if (t.k === k) return;

	    // Otherwise, capture the mouse point and location at the start.
	    else {
	      g.mouse = [p, t.invert(p)];
	      interrupt(this);
	      g.start();
	    }

	    noevent$2();
	    g.wheel = setTimeout(wheelidled, wheelDelay);
	    g.zoom("mouse", constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent));

	    function wheelidled() {
	      g.wheel = null;
	      g.end();
	    }
	  }

	  function mousedowned() {
	    if (touchending || !filter.apply(this, arguments)) return;
	    var g = gesture(this, arguments),
	        v = select(exports.event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true),
	        p = mouse(this);

	    dragDisable(exports.event.view);
	    nopropagation$2();
	    g.mouse = [p, this.__zoom.invert(p)];
	    interrupt(this);
	    g.start();

	    function mousemoved() {
	      noevent$2();
	      g.moved = true;
	      g.zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = mouse(g.that), g.mouse[1]), g.extent));
	    }

	    function mouseupped() {
	      v.on("mousemove.zoom mouseup.zoom", null);
	      yesdrag(exports.event.view, g.moved);
	      noevent$2();
	      g.end();
	    }
	  }

	  function dblclicked() {
	    if (!filter.apply(this, arguments)) return;
	    var t0 = this.__zoom,
	        p0 = mouse(this),
	        p1 = t0.invert(p0),
	        k1 = t0.k * (exports.event.shiftKey ? 0.5 : 2),
	        t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, arguments));

	    noevent$2();
	    if (duration > 0) select(this).transition().duration(duration).call(schedule, t1, p0);
	    else select(this).call(zoom.transform, t1);
	  }

	  function touchstarted() {
	    if (!filter.apply(this, arguments)) return;
	    var g = gesture(this, arguments),
	        touches$$1 = exports.event.changedTouches,
	        started,
	        n = touches$$1.length, i, t, p;

	    nopropagation$2();
	    for (i = 0; i < n; ++i) {
	      t = touches$$1[i], p = touch(this, touches$$1, t.identifier);
	      p = [p, this.__zoom.invert(p), t.identifier];
	      if (!g.touch0) g.touch0 = p, started = true;
	      else if (!g.touch1) g.touch1 = p;
	    }

	    // If this is a dbltap, reroute to the (optional) dblclick.zoom handler.
	    if (touchstarting) {
	      touchstarting = clearTimeout(touchstarting);
	      if (!g.touch1) {
	        g.end();
	        p = select(this).on("dblclick.zoom");
	        if (p) p.apply(this, arguments);
	        return;
	      }
	    }

	    if (started) {
	      touchstarting = setTimeout(function() { touchstarting = null; }, touchDelay);
	      interrupt(this);
	      g.start();
	    }
	  }

	  function touchmoved() {
	    var g = gesture(this, arguments),
	        touches$$1 = exports.event.changedTouches,
	        n = touches$$1.length, i, t, p, l;

	    noevent$2();
	    if (touchstarting) touchstarting = clearTimeout(touchstarting);
	    for (i = 0; i < n; ++i) {
	      t = touches$$1[i], p = touch(this, touches$$1, t.identifier);
	      if (g.touch0 && g.touch0[2] === t.identifier) g.touch0[0] = p;
	      else if (g.touch1 && g.touch1[2] === t.identifier) g.touch1[0] = p;
	    }
	    t = g.that.__zoom;
	    if (g.touch1) {
	      var p0 = g.touch0[0], l0 = g.touch0[1],
	          p1 = g.touch1[0], l1 = g.touch1[1],
	          dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp,
	          dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
	      t = scale(t, Math.sqrt(dp / dl));
	      p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
	      l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
	    }
	    else if (g.touch0) p = g.touch0[0], l = g.touch0[1];
	    else return;
	    g.zoom("touch", constrain(translate(t, p, l), g.extent));
	  }

	  function touchended() {
	    var g = gesture(this, arguments),
	        touches$$1 = exports.event.changedTouches,
	        n = touches$$1.length, i, t;

	    nopropagation$2();
	    if (touchending) clearTimeout(touchending);
	    touchending = setTimeout(function() { touchending = null; }, touchDelay);
	    for (i = 0; i < n; ++i) {
	      t = touches$$1[i];
	      if (g.touch0 && g.touch0[2] === t.identifier) delete g.touch0;
	      else if (g.touch1 && g.touch1[2] === t.identifier) delete g.touch1;
	    }
	    if (g.touch1 && !g.touch0) g.touch0 = g.touch1, delete g.touch1;
	    if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0]);
	    else g.end();
	  }

	  zoom.filter = function(_) {
	    return arguments.length ? (filter = typeof _ === "function" ? _ : constant$12(!!_), zoom) : filter;
	  };

	  zoom.extent = function(_) {
	    return arguments.length ? (extent = typeof _ === "function" ? _ : constant$12([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom) : extent;
	  };

	  zoom.scaleExtent = function(_) {
	    return arguments.length ? (k0 = +_[0], k1 = +_[1], zoom) : [k0, k1];
	  };

	  zoom.translateExtent = function(_) {
	    return arguments.length ? (x0 = +_[0][0], x1 = +_[1][0], y0 = +_[0][1], y1 = +_[1][1], zoom) : [[x0, y0], [x1, y1]];
	  };

	  zoom.duration = function(_) {
	    return arguments.length ? (duration = +_, zoom) : duration;
	  };

	  zoom.interpolate = function(_) {
	    return arguments.length ? (interpolate$$1 = _, zoom) : interpolate$$1;
	  };

	  zoom.on = function() {
	    var value = listeners.on.apply(listeners, arguments);
	    return value === listeners ? zoom : value;
	  };

	  return zoom;
	};

	exports.version = version;
	exports.bisect = bisectRight;
	exports.bisectRight = bisectRight;
	exports.bisectLeft = bisectLeft;
	exports.ascending = ascending;
	exports.bisector = bisector;
	exports.cross = cross;
	exports.descending = descending;
	exports.deviation = deviation;
	exports.extent = extent;
	exports.histogram = histogram;
	exports.thresholdFreedmanDiaconis = freedmanDiaconis;
	exports.thresholdScott = scott;
	exports.thresholdSturges = sturges;
	exports.max = max;
	exports.mean = mean;
	exports.median = median;
	exports.merge = merge;
	exports.min = min;
	exports.pairs = pairs;
	exports.permute = permute;
	exports.quantile = threshold;
	exports.range = sequence;
	exports.scan = scan;
	exports.shuffle = shuffle;
	exports.sum = sum;
	exports.ticks = ticks;
	exports.tickIncrement = tickIncrement;
	exports.tickStep = tickStep;
	exports.transpose = transpose;
	exports.variance = variance;
	exports.zip = zip;
	exports.axisTop = axisTop;
	exports.axisRight = axisRight;
	exports.axisBottom = axisBottom;
	exports.axisLeft = axisLeft;
	exports.brush = brush;
	exports.brushX = brushX;
	exports.brushY = brushY;
	exports.brushSelection = brushSelection;
	exports.chord = chord;
	exports.ribbon = ribbon;
	exports.nest = nest;
	exports.set = set$2;
	exports.map = map$1;
	exports.keys = keys;
	exports.values = values;
	exports.entries = entries;
	exports.color = color;
	exports.rgb = rgb;
	exports.hsl = hsl;
	exports.lab = lab;
	exports.hcl = hcl;
	exports.cubehelix = cubehelix;
	exports.dispatch = dispatch;
	exports.drag = drag;
	exports.dragDisable = dragDisable;
	exports.dragEnable = yesdrag;
	exports.dsvFormat = dsv;
	exports.csvParse = csvParse;
	exports.csvParseRows = csvParseRows;
	exports.csvFormat = csvFormat;
	exports.csvFormatRows = csvFormatRows;
	exports.tsvParse = tsvParse;
	exports.tsvParseRows = tsvParseRows;
	exports.tsvFormat = tsvFormat;
	exports.tsvFormatRows = tsvFormatRows;
	exports.easeLinear = linear$1;
	exports.easeQuad = quadInOut;
	exports.easeQuadIn = quadIn;
	exports.easeQuadOut = quadOut;
	exports.easeQuadInOut = quadInOut;
	exports.easeCubic = cubicInOut;
	exports.easeCubicIn = cubicIn;
	exports.easeCubicOut = cubicOut;
	exports.easeCubicInOut = cubicInOut;
	exports.easePoly = polyInOut;
	exports.easePolyIn = polyIn;
	exports.easePolyOut = polyOut;
	exports.easePolyInOut = polyInOut;
	exports.easeSin = sinInOut;
	exports.easeSinIn = sinIn;
	exports.easeSinOut = sinOut;
	exports.easeSinInOut = sinInOut;
	exports.easeExp = expInOut;
	exports.easeExpIn = expIn;
	exports.easeExpOut = expOut;
	exports.easeExpInOut = expInOut;
	exports.easeCircle = circleInOut;
	exports.easeCircleIn = circleIn;
	exports.easeCircleOut = circleOut;
	exports.easeCircleInOut = circleInOut;
	exports.easeBounce = bounceOut;
	exports.easeBounceIn = bounceIn;
	exports.easeBounceOut = bounceOut;
	exports.easeBounceInOut = bounceInOut;
	exports.easeBack = backInOut;
	exports.easeBackIn = backIn;
	exports.easeBackOut = backOut;
	exports.easeBackInOut = backInOut;
	exports.easeElastic = elasticOut;
	exports.easeElasticIn = elasticIn;
	exports.easeElasticOut = elasticOut;
	exports.easeElasticInOut = elasticInOut;
	exports.forceCenter = center$1;
	exports.forceCollide = collide;
	exports.forceLink = link;
	exports.forceManyBody = manyBody;
	exports.forceSimulation = simulation;
	exports.forceX = x$2;
	exports.forceY = y$2;
	exports.formatDefaultLocale = defaultLocale;
	exports.formatLocale = formatLocale;
	exports.formatSpecifier = formatSpecifier;
	exports.precisionFixed = precisionFixed;
	exports.precisionPrefix = precisionPrefix;
	exports.precisionRound = precisionRound;
	exports.geoArea = area;
	exports.geoBounds = bounds;
	exports.geoCentroid = centroid;
	exports.geoCircle = circle;
	exports.geoClipExtent = extent$1;
	exports.geoContains = contains;
	exports.geoDistance = distance;
	exports.geoGraticule = graticule;
	exports.geoGraticule10 = graticule10;
	exports.geoInterpolate = interpolate$1;
	exports.geoLength = length$1;
	exports.geoPath = index$1;
	exports.geoAlbers = albers;
	exports.geoAlbersUsa = albersUsa;
	exports.geoAzimuthalEqualArea = azimuthalEqualArea;
	exports.geoAzimuthalEqualAreaRaw = azimuthalEqualAreaRaw;
	exports.geoAzimuthalEquidistant = azimuthalEquidistant;
	exports.geoAzimuthalEquidistantRaw = azimuthalEquidistantRaw;
	exports.geoConicConformal = conicConformal;
	exports.geoConicConformalRaw = conicConformalRaw;
	exports.geoConicEqualArea = conicEqualArea;
	exports.geoConicEqualAreaRaw = conicEqualAreaRaw;
	exports.geoConicEquidistant = conicEquidistant;
	exports.geoConicEquidistantRaw = conicEquidistantRaw;
	exports.geoEquirectangular = equirectangular;
	exports.geoEquirectangularRaw = equirectangularRaw;
	exports.geoGnomonic = gnomonic;
	exports.geoGnomonicRaw = gnomonicRaw;
	exports.geoIdentity = identity$5;
	exports.geoProjection = projection;
	exports.geoProjectionMutator = projectionMutator;
	exports.geoMercator = mercator;
	exports.geoMercatorRaw = mercatorRaw;
	exports.geoOrthographic = orthographic;
	exports.geoOrthographicRaw = orthographicRaw;
	exports.geoStereographic = stereographic;
	exports.geoStereographicRaw = stereographicRaw;
	exports.geoTransverseMercator = transverseMercator;
	exports.geoTransverseMercatorRaw = transverseMercatorRaw;
	exports.geoRotation = rotation;
	exports.geoStream = geoStream;
	exports.geoTransform = transform;
	exports.cluster = cluster;
	exports.hierarchy = hierarchy;
	exports.pack = index$2;
	exports.packSiblings = siblings;
	exports.packEnclose = enclose;
	exports.partition = partition;
	exports.stratify = stratify;
	exports.tree = tree;
	exports.treemap = index$3;
	exports.treemapBinary = binary;
	exports.treemapDice = treemapDice;
	exports.treemapSlice = treemapSlice;
	exports.treemapSliceDice = sliceDice;
	exports.treemapSquarify = squarify;
	exports.treemapResquarify = resquarify;
	exports.interpolate = interpolateValue;
	exports.interpolateArray = array$1;
	exports.interpolateBasis = basis$1;
	exports.interpolateBasisClosed = basisClosed;
	exports.interpolateDate = date;
	exports.interpolateNumber = reinterpolate;
	exports.interpolateObject = object;
	exports.interpolateRound = interpolateRound;
	exports.interpolateString = interpolateString;
	exports.interpolateTransformCss = interpolateTransformCss;
	exports.interpolateTransformSvg = interpolateTransformSvg;
	exports.interpolateZoom = interpolateZoom;
	exports.interpolateRgb = interpolateRgb;
	exports.interpolateRgbBasis = rgbBasis;
	exports.interpolateRgbBasisClosed = rgbBasisClosed;
	exports.interpolateHsl = hsl$2;
	exports.interpolateHslLong = hslLong;
	exports.interpolateLab = lab$1;
	exports.interpolateHcl = hcl$2;
	exports.interpolateHclLong = hclLong;
	exports.interpolateCubehelix = cubehelix$2;
	exports.interpolateCubehelixLong = cubehelixLong;
	exports.quantize = quantize;
	exports.path = path;
	exports.polygonArea = area$1;
	exports.polygonCentroid = centroid$1;
	exports.polygonHull = hull;
	exports.polygonContains = contains$1;
	exports.polygonLength = length$2;
	exports.quadtree = quadtree;
	exports.queue = queue;
	exports.randomUniform = uniform;
	exports.randomNormal = normal;
	exports.randomLogNormal = logNormal;
	exports.randomBates = bates;
	exports.randomIrwinHall = irwinHall;
	exports.randomExponential = exponential$1;
	exports.request = request;
	exports.html = html;
	exports.json = json;
	exports.text = text;
	exports.xml = xml;
	exports.csv = csv$1;
	exports.tsv = tsv$1;
	exports.scaleBand = band;
	exports.scalePoint = point$1;
	exports.scaleIdentity = identity$6;
	exports.scaleLinear = linear$2;
	exports.scaleLog = log$1;
	exports.scaleOrdinal = ordinal;
	exports.scaleImplicit = implicit;
	exports.scalePow = pow$1;
	exports.scaleSqrt = sqrt$1;
	exports.scaleQuantile = quantile$$1;
	exports.scaleQuantize = quantize$1;
	exports.scaleThreshold = threshold$1;
	exports.scaleTime = time;
	exports.scaleUtc = utcTime;
	exports.schemeCategory10 = category10;
	exports.schemeCategory20b = category20b;
	exports.schemeCategory20c = category20c;
	exports.schemeCategory20 = category20;
	exports.interpolateCubehelixDefault = cubehelix$3;
	exports.interpolateRainbow = rainbow$1;
	exports.interpolateWarm = warm;
	exports.interpolateCool = cool;
	exports.interpolateViridis = viridis;
	exports.interpolateMagma = magma;
	exports.interpolateInferno = inferno;
	exports.interpolatePlasma = plasma;
	exports.scaleSequential = sequential;
	exports.creator = creator;
	exports.local = local$1;
	exports.matcher = matcher$1;
	exports.mouse = mouse;
	exports.namespace = namespace;
	exports.namespaces = namespaces;
	exports.select = select;
	exports.selectAll = selectAll;
	exports.selection = selection;
	exports.selector = selector;
	exports.selectorAll = selectorAll;
	exports.touch = touch;
	exports.touches = touches;
	exports.window = window;
	exports.customEvent = customEvent;
	exports.arc = arc;
	exports.area = area$2;
	exports.line = line;
	exports.pie = pie;
	exports.radialArea = radialArea;
	exports.radialLine = radialLine$1;
	exports.symbol = symbol;
	exports.symbols = symbols;
	exports.symbolCircle = circle$2;
	exports.symbolCross = cross$2;
	exports.symbolDiamond = diamond;
	exports.symbolSquare = square;
	exports.symbolStar = star;
	exports.symbolTriangle = triangle;
	exports.symbolWye = wye;
	exports.curveBasisClosed = basisClosed$1;
	exports.curveBasisOpen = basisOpen;
	exports.curveBasis = basis$2;
	exports.curveBundle = bundle;
	exports.curveCardinalClosed = cardinalClosed;
	exports.curveCardinalOpen = cardinalOpen;
	exports.curveCardinal = cardinal;
	exports.curveCatmullRomClosed = catmullRomClosed;
	exports.curveCatmullRomOpen = catmullRomOpen;
	exports.curveCatmullRom = catmullRom;
	exports.curveLinearClosed = linearClosed;
	exports.curveLinear = curveLinear;
	exports.curveMonotoneX = monotoneX;
	exports.curveMonotoneY = monotoneY;
	exports.curveNatural = natural;
	exports.curveStep = step;
	exports.curveStepAfter = stepAfter;
	exports.curveStepBefore = stepBefore;
	exports.stack = stack;
	exports.stackOffsetExpand = expand;
	exports.stackOffsetNone = none$1;
	exports.stackOffsetSilhouette = silhouette;
	exports.stackOffsetWiggle = wiggle;
	exports.stackOrderAscending = ascending$2;
	exports.stackOrderDescending = descending$2;
	exports.stackOrderInsideOut = insideOut;
	exports.stackOrderNone = none$2;
	exports.stackOrderReverse = reverse;
	exports.timeInterval = newInterval;
	exports.timeMillisecond = millisecond;
	exports.timeMilliseconds = milliseconds;
	exports.utcMillisecond = millisecond;
	exports.utcMilliseconds = milliseconds;
	exports.timeSecond = second;
	exports.timeSeconds = seconds;
	exports.utcSecond = second;
	exports.utcSeconds = seconds;
	exports.timeMinute = minute;
	exports.timeMinutes = minutes;
	exports.timeHour = hour;
	exports.timeHours = hours;
	exports.timeDay = day;
	exports.timeDays = days;
	exports.timeWeek = sunday;
	exports.timeWeeks = sundays;
	exports.timeSunday = sunday;
	exports.timeSundays = sundays;
	exports.timeMonday = monday;
	exports.timeMondays = mondays;
	exports.timeTuesday = tuesday;
	exports.timeTuesdays = tuesdays;
	exports.timeWednesday = wednesday;
	exports.timeWednesdays = wednesdays;
	exports.timeThursday = thursday;
	exports.timeThursdays = thursdays;
	exports.timeFriday = friday;
	exports.timeFridays = fridays;
	exports.timeSaturday = saturday;
	exports.timeSaturdays = saturdays;
	exports.timeMonth = month;
	exports.timeMonths = months;
	exports.timeYear = year;
	exports.timeYears = years;
	exports.utcMinute = utcMinute;
	exports.utcMinutes = utcMinutes;
	exports.utcHour = utcHour;
	exports.utcHours = utcHours;
	exports.utcDay = utcDay;
	exports.utcDays = utcDays;
	exports.utcWeek = utcSunday;
	exports.utcWeeks = utcSundays;
	exports.utcSunday = utcSunday;
	exports.utcSundays = utcSundays;
	exports.utcMonday = utcMonday;
	exports.utcMondays = utcMondays;
	exports.utcTuesday = utcTuesday;
	exports.utcTuesdays = utcTuesdays;
	exports.utcWednesday = utcWednesday;
	exports.utcWednesdays = utcWednesdays;
	exports.utcThursday = utcThursday;
	exports.utcThursdays = utcThursdays;
	exports.utcFriday = utcFriday;
	exports.utcFridays = utcFridays;
	exports.utcSaturday = utcSaturday;
	exports.utcSaturdays = utcSaturdays;
	exports.utcMonth = utcMonth;
	exports.utcMonths = utcMonths;
	exports.utcYear = utcYear;
	exports.utcYears = utcYears;
	exports.timeFormatDefaultLocale = defaultLocale$1;
	exports.timeFormatLocale = formatLocale$1;
	exports.isoFormat = formatIso;
	exports.isoParse = parseIso;
	exports.now = now;
	exports.timer = timer;
	exports.timerFlush = timerFlush;
	exports.timeout = timeout$1;
	exports.interval = interval$1;
	exports.transition = transition;
	exports.active = active;
	exports.interrupt = interrupt;
	exports.voronoi = voronoi;
	exports.zoom = zoom;
	exports.zoomTransform = transform$1;
	exports.zoomIdentity = identity$8;

	Object.defineProperty(exports, '__esModule', { value: true });

	})));


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var TrendsAPI = exports.TrendsAPI = function () {
	  function TrendsAPI(callback) {
	    _classCallCheck(this, TrendsAPI);

	    console.log('TrendsAPI');
	    var self = this;

	    __webpack_require__(7)().then(function (gapi) {
	      console.log('GoogleAPI library loaded');
	      gapi.load('client', start);

	      function start() {
	        var apiKey = 'AIzaSyAGzlgd2FAXWWaq10kSmTZ-y6SE15Xx3Hk';
	        var id = 'diseases';
	        gapi.client.init({
	          'apiKey': apiKey,
	          'clientId': 'diseases.apps.googleusercontent.com'
	        }).then(function () {
	          console.log('GoogleAPI client initialized');
	          self.gapi = gapi;
	        });
	      }
	    });
	  }

	  _createClass(TrendsAPI, [{
	    key: 'getTrends',
	    value: function getTrends(filter, callback) {
	      console.log('Requesting data for:', filter);
	      var geo = filter.geo,
	          terms = filter.terms;

	      var path = 'https://www.googleapis.com/trends/v1beta/graph?terms=' + encodeURIComponent(terms[0].entity);
	      if (geo.iso !== '') {
	        path += '&restrictions.geo=' + geo.iso;
	      }
	      console.log(path);
	      this.gapi.client.request({
	        'path': path
	      }).then(function (response) {
	        callback(response.result);
	      }, function (reason) {
	        console.log('Error: ' + reason.result.error.message);
	      });
	    }
	  }]);

	  return TrendsAPI;
	}(); //  weak

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/** @module google-client-api */

	var scriptjs = __webpack_require__( 8 ),
		promise = __webpack_require__( 9 );

	var callbacks = [];

	global.$$onClientLoad = function() {

		for( var i = 0, len = callbacks.length; i < len; i++ ) {

			doResolve.apply( undefined, callbacks[ i ] );
		}
	};

	function doResolve( resolve, onComplete ) {

		resolve( global.gapi );

		if( onComplete )
			onComplete( global.gapi );
	}


	/** 
	 * This module is a function which will return a Google Client API object 
	 * (https://developers.google.com/api-client-library/javascript/dev/dev_jscript) assynchronously.
	 *
	 * This function returns a promise. (if you're into promises) Which will return the gapi Object.
	 *
	 * If you're not into promises then you can simply call this function and pass in a callback object.
	 * 
	 * @param  {Function} onComplete an optional callback which will return the Google Client API Object.
	 * @return {Promise} This function also returns a promise if you're into promises which will
	 *                   return the Google Client API Object.
	 *
	 * @example Using with Promise
	 * require( 'google-client-api' )().then( function( gapi ) {
	 * 	// Do something with the gapi object
	 * });
	 *
	 * @example Using with callback
	 * require( 'google-client-api' )( function( gapi ) {
	 * 	// Do something with the gapi object
	 * });
	 */
	module.exports = function( onComplete ) {

		return new promise( function( resolve, reject ) {

			if( global.gapi ) {

				doResolve( resolve, onComplete );
			} else {

				callbacks.push( [ resolve, onComplete ] );

				if( callbacks.length == 1 ) {

					scriptjs( 'https://apis.google.com/js/client.js?onload=$$onClientLoad' );
				}
			}
		});
	};
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	  * $script.js JS loader & dependency manager
	  * https://github.com/ded/script.js
	  * (c) Dustin Diaz 2014 | License MIT
	  */

	(function (name, definition) {
	  if (typeof module != 'undefined' && module.exports) module.exports = definition()
	  else if (true) !(__WEBPACK_AMD_DEFINE_FACTORY__ = (definition), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
	  else this[name] = definition()
	})('$script', function () {
	  var doc = document
	    , head = doc.getElementsByTagName('head')[0]
	    , s = 'string'
	    , f = false
	    , push = 'push'
	    , readyState = 'readyState'
	    , onreadystatechange = 'onreadystatechange'
	    , list = {}
	    , ids = {}
	    , delay = {}
	    , scripts = {}
	    , scriptpath
	    , urlArgs

	  function every(ar, fn) {
	    for (var i = 0, j = ar.length; i < j; ++i) if (!fn(ar[i])) return f
	    return 1
	  }
	  function each(ar, fn) {
	    every(ar, function (el) {
	      return !fn(el)
	    })
	  }

	  function $script(paths, idOrDone, optDone) {
	    paths = paths[push] ? paths : [paths]
	    var idOrDoneIsDone = idOrDone && idOrDone.call
	      , done = idOrDoneIsDone ? idOrDone : optDone
	      , id = idOrDoneIsDone ? paths.join('') : idOrDone
	      , queue = paths.length
	    function loopFn(item) {
	      return item.call ? item() : list[item]
	    }
	    function callback() {
	      if (!--queue) {
	        list[id] = 1
	        done && done()
	        for (var dset in delay) {
	          every(dset.split('|'), loopFn) && !each(delay[dset], loopFn) && (delay[dset] = [])
	        }
	      }
	    }
	    setTimeout(function () {
	      each(paths, function loading(path, force) {
	        if (path === null) return callback()
	        
	        if (!force && !/^https?:\/\//.test(path) && scriptpath) {
	          path = (path.indexOf('.js') === -1) ? scriptpath + path + '.js' : scriptpath + path;
	        }
	        
	        if (scripts[path]) {
	          if (id) ids[id] = 1
	          return (scripts[path] == 2) ? callback() : setTimeout(function () { loading(path, true) }, 0)
	        }

	        scripts[path] = 1
	        if (id) ids[id] = 1
	        create(path, callback)
	      })
	    }, 0)
	    return $script
	  }

	  function create(path, fn) {
	    var el = doc.createElement('script'), loaded
	    el.onload = el.onerror = el[onreadystatechange] = function () {
	      if ((el[readyState] && !(/^c|loade/.test(el[readyState]))) || loaded) return;
	      el.onload = el[onreadystatechange] = null
	      loaded = 1
	      scripts[path] = 2
	      fn()
	    }
	    el.async = 1
	    el.src = urlArgs ? path + (path.indexOf('?') === -1 ? '?' : '&') + urlArgs : path;
	    head.insertBefore(el, head.lastChild)
	  }

	  $script.get = create

	  $script.order = function (scripts, id, done) {
	    (function callback(s) {
	      s = scripts.shift()
	      !scripts.length ? $script(s, id, done) : $script(s, callback)
	    }())
	  }

	  $script.path = function (p) {
	    scriptpath = p
	  }
	  $script.urlArgs = function (str) {
	    urlArgs = str;
	  }
	  $script.ready = function (deps, ready, req) {
	    deps = deps[push] ? deps : [deps]
	    var missing = [];
	    !each(deps, function (dep) {
	      list[dep] || missing[push](dep);
	    }) && every(deps, function (dep) {return list[dep]}) ?
	      ready() : !function (key) {
	      delay[key] = delay[key] || []
	      delay[key][push](ready)
	      req && req(missing)
	    }(deps.join('|'))
	    return $script
	  }

	  $script.done = function (idOrDone) {
	    $script([null], idOrDone)
	  }

	  return $script
	});


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(10)
	__webpack_require__(15)
	__webpack_require__(16)
	__webpack_require__(17)

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var asap = __webpack_require__(11)

	module.exports = Promise;
	function Promise(fn) {
	  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new')
	  if (typeof fn !== 'function') throw new TypeError('not a function')
	  var state = null
	  var value = null
	  var deferreds = []
	  var self = this

	  this.then = function(onFulfilled, onRejected) {
	    return new self.constructor(function(resolve, reject) {
	      handle(new Handler(onFulfilled, onRejected, resolve, reject))
	    })
	  }

	  function handle(deferred) {
	    if (state === null) {
	      deferreds.push(deferred)
	      return
	    }
	    asap(function() {
	      var cb = state ? deferred.onFulfilled : deferred.onRejected
	      if (cb === null) {
	        (state ? deferred.resolve : deferred.reject)(value)
	        return
	      }
	      var ret
	      try {
	        ret = cb(value)
	      }
	      catch (e) {
	        deferred.reject(e)
	        return
	      }
	      deferred.resolve(ret)
	    })
	  }

	  function resolve(newValue) {
	    try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
	      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.')
	      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
	        var then = newValue.then
	        if (typeof then === 'function') {
	          doResolve(then.bind(newValue), resolve, reject)
	          return
	        }
	      }
	      state = true
	      value = newValue
	      finale()
	    } catch (e) { reject(e) }
	  }

	  function reject(newValue) {
	    state = false
	    value = newValue
	    finale()
	  }

	  function finale() {
	    for (var i = 0, len = deferreds.length; i < len; i++)
	      handle(deferreds[i])
	    deferreds = null
	  }

	  doResolve(fn, resolve, reject)
	}


	function Handler(onFulfilled, onRejected, resolve, reject){
	  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
	  this.onRejected = typeof onRejected === 'function' ? onRejected : null
	  this.resolve = resolve
	  this.reject = reject
	}

	/**
	 * Take a potentially misbehaving resolver function and make sure
	 * onFulfilled and onRejected are only called once.
	 *
	 * Makes no guarantees about asynchrony.
	 */
	function doResolve(fn, onFulfilled, onRejected) {
	  var done = false;
	  try {
	    fn(function (value) {
	      if (done) return
	      done = true
	      onFulfilled(value)
	    }, function (reason) {
	      if (done) return
	      done = true
	      onRejected(reason)
	    })
	  } catch (ex) {
	    if (done) return
	    done = true
	    onRejected(ex)
	  }
	}


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, setImmediate) {
	// Use the fastest possible means to execute a task in a future turn
	// of the event loop.

	// linked list of tasks (single, with head node)
	var head = {task: void 0, next: null};
	var tail = head;
	var flushing = false;
	var requestFlush = void 0;
	var isNodeJS = false;

	function flush() {
	    /* jshint loopfunc: true */

	    while (head.next) {
	        head = head.next;
	        var task = head.task;
	        head.task = void 0;
	        var domain = head.domain;

	        if (domain) {
	            head.domain = void 0;
	            domain.enter();
	        }

	        try {
	            task();

	        } catch (e) {
	            if (isNodeJS) {
	                // In node, uncaught exceptions are considered fatal errors.
	                // Re-throw them synchronously to interrupt flushing!

	                // Ensure continuation if the uncaught exception is suppressed
	                // listening "uncaughtException" events (as domains does).
	                // Continue in next event to avoid tick recursion.
	                if (domain) {
	                    domain.exit();
	                }
	                setTimeout(flush, 0);
	                if (domain) {
	                    domain.enter();
	                }

	                throw e;

	            } else {
	                // In browsers, uncaught exceptions are not fatal.
	                // Re-throw them asynchronously to avoid slow-downs.
	                setTimeout(function() {
	                   throw e;
	                }, 0);
	            }
	        }

	        if (domain) {
	            domain.exit();
	        }
	    }

	    flushing = false;
	}

	if (typeof process !== "undefined" && process.nextTick) {
	    // Node.js before 0.9. Note that some fake-Node environments, like the
	    // Mocha test runner, introduce a `process` global without a `nextTick`.
	    isNodeJS = true;

	    requestFlush = function () {
	        process.nextTick(flush);
	    };

	} else if (typeof setImmediate === "function") {
	    // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
	    if (typeof window !== "undefined") {
	        requestFlush = setImmediate.bind(window, flush);
	    } else {
	        requestFlush = function () {
	            setImmediate(flush);
	        };
	    }

	} else if (typeof MessageChannel !== "undefined") {
	    // modern browsers
	    // http://www.nonblocking.io/2011/06/windownexttick.html
	    var channel = new MessageChannel();
	    channel.port1.onmessage = flush;
	    requestFlush = function () {
	        channel.port2.postMessage(0);
	    };

	} else {
	    // old browsers
	    requestFlush = function () {
	        setTimeout(flush, 0);
	    };
	}

	function asap(task) {
	    tail = tail.next = {
	        task: task,
	        domain: isNodeJS && process.domain,
	        next: null
	    };

	    if (!flushing) {
	        flushing = true;
	        requestFlush();
	    }
	};

	module.exports = asap;


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(12), __webpack_require__(13).setImmediate))

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;

	process.listeners = function (name) { return [] }

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	var apply = Function.prototype.apply;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) {
	  if (timeout) {
	    timeout.close();
	  }
	};

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// setimmediate attaches itself to the global object
	__webpack_require__(14);
	exports.setImmediate = setImmediate;
	exports.clearImmediate = clearImmediate;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
	    "use strict";

	    if (global.setImmediate) {
	        return;
	    }

	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;

	    function setImmediate(callback) {
	      // Callback can either be a function or a string
	      if (typeof callback !== "function") {
	        callback = new Function("" + callback);
	      }
	      // Copy function arguments
	      var args = new Array(arguments.length - 1);
	      for (var i = 0; i < args.length; i++) {
	          args[i] = arguments[i + 1];
	      }
	      // Store and register the task
	      var task = { callback: callback, args: args };
	      tasksByHandle[nextHandle] = task;
	      registerImmediate(nextHandle);
	      return nextHandle++;
	    }

	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }

	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	        case 0:
	            callback();
	            break;
	        case 1:
	            callback(args[0]);
	            break;
	        case 2:
	            callback(args[0], args[1]);
	            break;
	        case 3:
	            callback(args[0], args[1], args[2]);
	            break;
	        default:
	            callback.apply(undefined, args);
	            break;
	        }
	    }

	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }

	    function installNextTickImplementation() {
	        registerImmediate = function(handle) {
	            process.nextTick(function () { runIfPresent(handle); });
	        };
	    }

	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function() {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }

	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function(event) {
	            if (event.source === global &&
	                typeof event.data === "string" &&
	                event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };

	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }

	        registerImmediate = function(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }

	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function(event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };

	        registerImmediate = function(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }

	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }

	    function installSetTimeoutImplementation() {
	        registerImmediate = function(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }

	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();

	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();

	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();

	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();

	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }

	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(12)))

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var Promise = __webpack_require__(10)
	var asap = __webpack_require__(11)

	module.exports = Promise
	Promise.prototype.done = function (onFulfilled, onRejected) {
	  var self = arguments.length ? this.then.apply(this, arguments) : this
	  self.then(null, function (err) {
	    asap(function () {
	      throw err
	    })
	  })
	}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	//This file contains the ES6 extensions to the core Promises/A+ API

	var Promise = __webpack_require__(10)
	var asap = __webpack_require__(11)

	module.exports = Promise

	/* Static Functions */

	function ValuePromise(value) {
	  this.then = function (onFulfilled) {
	    if (typeof onFulfilled !== 'function') return this
	    return new Promise(function (resolve, reject) {
	      asap(function () {
	        try {
	          resolve(onFulfilled(value))
	        } catch (ex) {
	          reject(ex);
	        }
	      })
	    })
	  }
	}
	ValuePromise.prototype = Promise.prototype

	var TRUE = new ValuePromise(true)
	var FALSE = new ValuePromise(false)
	var NULL = new ValuePromise(null)
	var UNDEFINED = new ValuePromise(undefined)
	var ZERO = new ValuePromise(0)
	var EMPTYSTRING = new ValuePromise('')

	Promise.resolve = function (value) {
	  if (value instanceof Promise) return value

	  if (value === null) return NULL
	  if (value === undefined) return UNDEFINED
	  if (value === true) return TRUE
	  if (value === false) return FALSE
	  if (value === 0) return ZERO
	  if (value === '') return EMPTYSTRING

	  if (typeof value === 'object' || typeof value === 'function') {
	    try {
	      var then = value.then
	      if (typeof then === 'function') {
	        return new Promise(then.bind(value))
	      }
	    } catch (ex) {
	      return new Promise(function (resolve, reject) {
	        reject(ex)
	      })
	    }
	  }

	  return new ValuePromise(value)
	}

	Promise.all = function (arr) {
	  var args = Array.prototype.slice.call(arr)

	  return new Promise(function (resolve, reject) {
	    if (args.length === 0) return resolve([])
	    var remaining = args.length
	    function res(i, val) {
	      try {
	        if (val && (typeof val === 'object' || typeof val === 'function')) {
	          var then = val.then
	          if (typeof then === 'function') {
	            then.call(val, function (val) { res(i, val) }, reject)
	            return
	          }
	        }
	        args[i] = val
	        if (--remaining === 0) {
	          resolve(args);
	        }
	      } catch (ex) {
	        reject(ex)
	      }
	    }
	    for (var i = 0; i < args.length; i++) {
	      res(i, args[i])
	    }
	  })
	}

	Promise.reject = function (value) {
	  return new Promise(function (resolve, reject) { 
	    reject(value);
	  });
	}

	Promise.race = function (values) {
	  return new Promise(function (resolve, reject) { 
	    values.forEach(function(value){
	      Promise.resolve(value).then(resolve, reject);
	    })
	  });
	}

	/* Prototype Methods */

	Promise.prototype['catch'] = function (onRejected) {
	  return this.then(null, onRejected);
	}


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	//This file contains then/promise specific extensions that are only useful for node.js interop

	var Promise = __webpack_require__(10)
	var asap = __webpack_require__(11)

	module.exports = Promise

	/* Static Functions */

	Promise.denodeify = function (fn, argumentCount) {
	  argumentCount = argumentCount || Infinity
	  return function () {
	    var self = this
	    var args = Array.prototype.slice.call(arguments)
	    return new Promise(function (resolve, reject) {
	      while (args.length && args.length > argumentCount) {
	        args.pop()
	      }
	      args.push(function (err, res) {
	        if (err) reject(err)
	        else resolve(res)
	      })
	      var res = fn.apply(self, args)
	      if (res && (typeof res === 'object' || typeof res === 'function') && typeof res.then === 'function') {
	        resolve(res)
	      }
	    })
	  }
	}
	Promise.nodeify = function (fn) {
	  return function () {
	    var args = Array.prototype.slice.call(arguments)
	    var callback = typeof args[args.length - 1] === 'function' ? args.pop() : null
	    var ctx = this
	    try {
	      return fn.apply(this, arguments).nodeify(callback, ctx)
	    } catch (ex) {
	      if (callback === null || typeof callback == 'undefined') {
	        return new Promise(function (resolve, reject) { reject(ex) })
	      } else {
	        asap(function () {
	          callback.call(ctx, ex)
	        })
	      }
	    }
	  }
	}

	Promise.prototype.nodeify = function (callback, ctx) {
	  if (typeof callback != 'function') return this

	  this.then(function (value) {
	    asap(function () {
	      callback.call(ctx, null, value)
	    })
	  }, function (err) {
	    asap(function () {
	      callback.call(ctx, err)
	    })
	  })
	}


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(19);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(21)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/sass-loader/index.js!./app.scss", function() {
				var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/sass-loader/index.js!./app.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(20)();
	// imports


	// module
	exports.push([module.id, "body .test h1 {\n  color: white; }\n\n.hidden {\n  display: none; }\n\nsvg.chart {\n  width: 840px;\n  height: 430px;\n  transition: opacity 1s linear, height 1s linear; }\n  svg.chart.hidden-chart {\n    display: block;\n    opacity: 0;\n    height: 0; }\n\nsvg path.line {\n  fill: none; }\n", ""]);

	// exports


/***/ }),
/* 20 */
/***/ (function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ })
/******/ ]);