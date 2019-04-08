
import data from '../data/data.json';

const App = {
    Data: data,
    Now: new Date(),
    PageId: null,
    Schedules: null,
    Schedule: null,
    CurrentDayOfWeek: '',
    NextTimes: [],

    selectedDayOfWeek: null,

    DOM: {
        Pages: {
            Home: document.getElementById('homePage'),
            Schedule: document.getElementById('schedulePage')
        },
        Itineraries: document.querySelectorAll('.js-next-time'),
        Title: document.querySelector('.js-title'),
        Schedules: document.querySelectorAll('.js-schedule'),
        Tabs: document.querySelectorAll('.js-tab'),
        TabPanels: document.querySelectorAll('.js-tabpanel')
    },

    init() {

        // Settings
        this.PageId = document.body.dataset.pageId;
        this.Schedules = this.Data[this.PageId];

        this.getDayOfWeek();
        this.getNextTime();
        this.createNavigation();
    },

    // GET/SET
    getDayOfWeek() {

        // get weekday (sunday is 0, monday is 1, and so on.)
        var weekday = this.Now.getDay();
        if (this.isAfterMidnight(this.Now)) {

            // Fix current weekday - make today yesterday
            weekday = weekday - 1;
            this.Now.setDate(this.Now.getDate() - 1);

            // if sunday gets a negative value, make it saturday
            if (weekday == -1) {
                weekday = 6;
            }
        }

        var dayOfWeek;
        if (weekday >= 1 && weekday <= 5) {
            dayOfWeek = 'weekday';
        }
        else if (weekday == 6) {
            dayOfWeek = 'saturday';
        }
        else if (weekday == 0) {
            dayOfWeek = 'sunday';
        }

        this.CurrentDayOfWeek = dayOfWeek;
        this.selectedDayOfWeek = dayOfWeek;
    },
    getNextTime() {
        
        this.Schedules.forEach((schedule, index) => {

            var schedule = schedule.days.find(day => day.day === this.CurrentDayOfWeek).schedule;

            schedule.find(time => {

                // build dateTime based on time
                var dateTime = new Date(this.Now);
                dateTime.setHours(time.hour, time.minute, 0);
                if (this.isAfterMidnight(dateTime)) {
                    dateTime.setDate(dateTime.getDate() + 1); // add one day
                }
                
                // check if it's next
                if (dateTime.getTime() > this.Now.getTime()) {

                    // GOT THE NEXT TIME

                    // Set next time
                    this.DOM.Itineraries[index].textContent = dateTime.toLocaleTimeString('PT-pt', { hour: 'numeric', minute: "2-digit"}) // Populate itineraries
                    return time.isNext = true;
                
                };
            });
        });

    },
    isAfterMidnight(date) {
        var hours = date.getHours();
        return hours >= 0 && hours < 5;
    },

    // EVENTS
    createNavigation() {

        document.addEventListener('click', (event) => {

            var clickedElement = event.currentTarget.activeElement;

            if (clickedElement.matches('.js-goto-schedule')) {
                var way = clickedElement.dataset.way;
                this.goToSchedulePage(way);
            }
            else if (clickedElement.matches('.js-goto-home')) {
                this.goToHomePage();
            }
            else if (clickedElement.matches('.js-tab')) {
                this.selectedDayOfWeek = clickedElement.dataset.dayofweek;
                this.selectTab();
            }

        }, false);
    },


    // DOM MANIPULATION
    goToSchedulePage(way) {

        this.Schedule = this.Schedules.find(x => x.way === way);

        this.renderTitle();
        this.renderSchedule();
        this.getNextTime();
        this.selectTab();

        // close Home page tab
        this.DOM.Pages.Home.setAttribute("aria-hidden", true);

        // open Schedule page
        this.DOM.Pages.Schedule.classList.add("is-active");
        this.DOM.Pages.Schedule.setAttribute("aria-hidden", false);

        this.scrollToCurrentTime();
    },
    goToHomePage() {
        this.DOM.Pages.Home.setAttribute("aria-hidden", false);

        this.DOM.Pages.Schedule.classList.remove("is-active");
        this.DOM.Pages.Schedule.setAttribute("aria-hidden", true);

        // reset tab selection
        this.selectedDayOfWeek = this.CurrentDayOfWeek;
    },
    selectTab() {

        // hide tabs
        this.DOM.Tabs.forEach(tab => {
            tab.setAttribute("aria-selected", false);
        });
        this.DOM.TabPanels.forEach(panel => {
            panel.setAttribute("aria-hidden", true);
        });

        // show tab
        var attr = `[data-dayofweek="${this.selectedDayOfWeek}"]`;
        document.querySelector(`.js-tab${attr}`).setAttribute("aria-selected", true);
        document.querySelector(`.js-tabpanel${attr}`).setAttribute("aria-hidden", false);
        
    },
    scrollToCurrentTime() {

        // scroll to current time schedule
        setTimeout(() => {
            document.querySelector(".is-next").scrollIntoView({ block: "center" });
        }, 400);
    },


    // RENDER
    renderTitle() {
        this.DOM.Title.textContent = `${this.Schedule.departure} - ${this.Schedule.arrival}`;
    },
    renderSchedule() {
        this.DOM.Schedules.forEach((schedule, i) => {
            var html = '';
            this.Schedule.days[i].schedule.forEach((time, j) => {
                html += `
                    <li ${time.isNext ? 'class="is-next"' : ''}>
                        <span>${time.hour}:${time.minute}</span>
                    </li>
                `;
            });
            this.DOM.Schedules[i].innerHTML = html;
        });
    }
}

App.init();
window.App = App;