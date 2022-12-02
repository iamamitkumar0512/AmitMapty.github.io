'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const btnsMenu = document.querySelector('.btns-menu');
const deleteAllWorkoutBtn = document.querySelector('.btn-reset');
const btnSort = document.querySelector('.btn-sort');
const sortBar = document.querySelector('.sort-bar');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-9);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class App {
  #map;
  #mapEvent;
  #workouts = [];
  #markers = [];

  constructor() {
    this._getposition();
    this._getLocalStorage();
    inputType.addEventListener('change', this._toogleEleavtionField.bind(this));
    form.addEventListener('submit', this._newWorkout.bind(this));
    containerWorkouts.addEventListener('click', this._moveToMarker.bind(this));
    containerWorkouts.addEventListener('click', this._deleteWorkout.bind(this));
    deleteAllWorkoutBtn.addEventListener(
      'click',
      this._removeAllWorkouts.bind(this)
    );
    btnSort.addEventListener('click', this._toggleSortBtn);
    sortBar.addEventListener('click', this._sortAndRender.bind(this));
  }

  _getposition() {
    navigator.geolocation.getCurrentPosition(
      this._loadmap.bind(this),
      function () {
        alert('Could not get your location');
      }
    );
  }

  _loadmap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coordsArray = [latitude, longitude];

    this.#map = L.map('map').setView(coordsArray, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showform.bind(this));

    this.#workouts.forEach(data => this._renderMarkup(data));
  }

  _toogleEleavtionField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _showform(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _newWorkout(e) {
    // helper function
    const finiteData = (...value) => value.every(v => Number.isFinite(v));
    const positiveData = (...value) => value.every(v => v > 0);

    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    const coordsArray = [lat, lng];

    //Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let newWrokout;

    //If workout is running create running class
    if (type == 'running') {
      const cadence = +inputCadence.value;

      //Check if data is valid
      if (
        !positiveData(distance, cadence, duration) ||
        !finiteData(distance, duration, cadence)
      )
        return alert('Input need to be postive and finite');

      newWrokout = new Running(coordsArray, distance, duration, cadence);
    }

    //if workout is cycling create cycling class
    if (type == 'cycling') {
      const elevation = +inputElevation.value;

      //Check if data is valid
      if (
        !positiveData(distance, duration) ||
        !finiteData(distance, duration, elevation)
      )
        return alert('Input need to be postive and finite');

      newWrokout = new Cycling(coordsArray, distance, duration, elevation);
    }

    //add new object to workout array
    this.#workouts.push(newWrokout);

    //render workout on map as marker
    this._renderMarkup(newWrokout);

    // render workout on list
    this._renderWorkout(newWrokout);

    this._toggleRemoveAllBtn();

    //hide form + clear input field
    // prettier-ignore
    inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = '';

    form.classList.add('hidden');

    // Set local Storage

    this._setLocalStorage();
  }

  _renderMarkup(workout) {
    const mark = L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          maxHeight: 80,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type == 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();

    this.#markers.push(mark);
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const workoutData = JSON.parse(localStorage.getItem('workouts'));
    if (!workoutData) return;

    this.#workouts = workoutData;
    this.#workouts.forEach(data => this._renderWorkout(data));
    this._toggleRemoveAllBtn();
  }

  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <div class=workout__heading-container>
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__icon-delete">
          <span class="trash">
              <span></span>
              <i></i>
            </span>
        </div>
    </div>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type == 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;

    if (workout.type == 'running') {
      html += `
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
    }
    if (workout.type == 'cycling') {
      html += `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevation}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>
      `;
    }
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToMarker(e) {
    const workoutElement = e.target.closest('.workout');
    if (!workoutElement) return;

    const workout = this.#workouts.find(
      work => work.id === workoutElement.dataset.id
    );

    this.#map.setView(workout.coords, 13, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
  _toggleRemoveAllBtn() {
    if (this.#workouts.length === 0) {
      btnsMenu.classList.add('btns-menu--hidden');
    } else {
      btnsMenu.classList.remove('btns-menu--hidden');
    }
  }

  _deleteWorkout(e) {
    const workoutEl = e.target.closest('.workout');
    const deleteBtn = e.target.closest('.workout__icon-delete');
    if (!workoutEl || !deleteBtn) return;
    setTimeout(() => workoutEl.remove(), 250);
    let index;

    const updatedWorkouts = this.#workouts.filter((work, i) => {
      index = i;
      return work.id != workoutEl.dataset.id;
    });

    this.#markers[index].remove();

    this.#markers.splice(index);

    this.#workouts = updatedWorkouts;
    localStorage.removeItem('workouts');
    this._setLocalStorage();
    this._toggleRemoveAllBtn();
  }

  _removeAllWorkouts() {
    const allWorkouts = document.querySelectorAll('.workout');
    allWorkouts.forEach(workout => workout.remove());

    // Clearing local storage
    this.reset();
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }

  _sortAndRender(e) {
    const el = e.target.closest('.sort-bar__btn-radio');
    let currentDirection = 'descending'; //default
    if (!el) return;

    const type = el.id;

    // get which direction to sort
    const typeValues = this.#workouts.map(workout => {
      // console.log(workout[type]);
      return workout[type];
    });

    const sortedAscending = typeValues
      .slice()
      .sort(function (a, b) {
        return a - b;
      })
      .join('');

    const sortedDescending = typeValues
      .slice()
      .sort(function (a, b) {
        return b - a;
      })
      .join('');

    // Ascending order
    if (typeValues.join('') === sortedAscending) {
      currentDirection = 'ascending';
    }
    // Descending order
    if (typeValues.join('') === sortedDescending) {
      currentDirection = 'descending';
    }

    // sort workouts array
    this._sortArray(this.#workouts, currentDirection, type);

    // Render all workouts again

    // clear current rendered workouts from DOM
    containerWorkouts
      .querySelectorAll('.workout')
      .forEach(workout => workout.remove());

    // clear workouts from map
    this.#markers.forEach(marker => marker.remove());

    this.#markers = [];

    // render workout list again sorted
    this.#workouts.forEach(workout => {
      this._renderWorkout(workout);
      this._renderMarkup(workout);
    });
  }

  _toggleSortBtn() {
    sortBar.classList.toggle('sort-bar--hidden');
  }

  _sortArray(array, currentDirection, type) {
    // sort opposite to the currentdirection
    if (currentDirection === 'ascending') {
      array.sort((a, b) => b[type] - a[type]);
    }
    if (currentDirection === 'descending') {
      array.sort((a, b) => a[type] - b[type]);
    }
  }
}

const app = new App();
