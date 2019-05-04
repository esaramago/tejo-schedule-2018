
import data from '../data/data.json';

const App = {
    Data: data,
    Now: new Date(),
    //Now: new Date(2019, 5-1, 3, 1, 55),
    PageId: null,

    CurrentDayOfWeek: '',

    Current: {
        Hub: null,
        Way: null,
        Schedule: null,
        DayOfWeek: '',
        IsBetweenSchedules: null
    },

    SelectedDayOfWeek: null, // selected tab

    DOM: {
        Pages: {
            Home: document.getElementById('homePage'),
            Schedule: document.getElementById('schedulePage')
        },
        Itineraries: document.querySelectorAll('.js-next-time'),
        Title: document.querySelector('.js-title'),
        Schedules: document.querySelectorAll('.js-schedule'),
        Tabs: document.querySelectorAll('.js-tab'),
        TabPanels: document.querySelectorAll('.js-tabpanel'),

        Waiting: document.querySelectorAll('.is-waiting')
    },

    init() {

        // Settings
        this.PageId = document.body.dataset.pageId;
        this.Current.Hub = this.Data[this.PageId];

        this.Current.Hub.forEach((way, index) => {
            this.getDayOfWeek(way);
            this.getNextTime(index);
        });
        this.createNavigation();

        // show hidden elements
        this.DOM.Waiting.forEach(el => {
            el.classList.remove('is-waiting');
        });
    },

    // GET/SET
    getDayOfWeek(way) {
        
        // get today's first dateTime based on array time
        var weekday = this.getWeekday(this.Now); // get weekday
        var schedule = way.days.find(x => x.day == weekday).schedule; // get today's schedule
        var firstTime = new Date(this.Now);
        firstTime.setHours(schedule[0].h, schedule[0].m, 0);

        // get yesterday's last dateTime based on array time
        var yesterday = new Date(this.Now); yesterday.setDate(yesterday.getDate() - 1);
        var yesterdayWeekday = this.getWeekday(yesterday); // get weekday
        var yesterdaySchedule = way.days.find(x => x.day == yesterdayWeekday).schedule; // get yesterday's schedule
        var yesterdayLastArrayTime = yesterdaySchedule[yesterdaySchedule.length - 1];
        
        if (yesterdayLastArrayTime) {

            // get yesterday's last time
            var yesterdayLastTime;
            if (yesterdayLastArrayTime.h >= 5) { // if last time is after 5:00, I assume that it's still yesterday
                yesterdayLastTime = new Date(yesterday);
            }
            else { // if last time is before 5:00 (after midnight), I assume that it's today
                yesterdayLastTime = new Date(this.Now);
            }
            yesterdayLastTime.setHours(yesterdayLastArrayTime.h, yesterdayLastArrayTime.m, 0);
            
            // check if now is in yesterday's schedule
            if (this.Now.getTime() < yesterdayLastTime.getTime()) {
                weekday = yesterdayWeekday;
                schedule = yesterdaySchedule;
            }

            // set weekday and schedule 
            this.Current.DayOfWeek = weekday;
            this.Current.Schedule = schedule;
            this.SelectedDayOfWeek = weekday;

            // check if now is between schedules
            this.Current.IsBetweenSchedules = this.Now.getTime() > yesterdayLastTime.getTime() && this.Now.getTime() < firstTime.getTime();

        }

    },
    getNextTime(index) {

        this.Current.Schedule.find(time => {

            // build dateTime based on time
            var dateTime = new Date(this.Now); // time of schedule
            dateTime.setHours(time.h, time.m, 0);

            if (!this.Current.IsBetweenSchedules && this.Now.getHours() < 5 && dateTime.getHours() >= 5) { // ToDo: alterar 5 para último horário 
                dateTime.setDate(dateTime.getDate() - 1); // set tomorrow
            }

            // check if it's next
            if (dateTime.getTime() > this.Now.getTime()) {

                // GOT THE NEXT TIME

                // Set next time
                this.DOM.Itineraries[index].textContent = dateTime.toLocaleTimeString('PT-pt', { hour: 'numeric', minute: "2-digit" }) // Populate itineraries
                return time.isNext = true;

            };
        });

    },
    getWeekday(date) {

        var weekday = date.getDay();
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

        return dayOfWeek;
    },

    // EVENTS
    createNavigation() {

        document.addEventListener('click', (event) => {

            var nav = document.querySelector('.js-nav');
            var clickedElement = event.currentTarget.activeElement;

            if (clickedElement.matches('.js-goto-schedule')) {
                var way = clickedElement.dataset.way;
                this.goToSchedulePage(way);
            }
            else if (clickedElement.matches('.js-goto-home')) {
                this.goToHomePage();
            }
            else if (clickedElement.matches('.js-tab')) {
                this.SelectedDayOfWeek = clickedElement.dataset.dayofweek;
                this.selectTab();
            }
            else if (clickedElement.matches('.js-toggle-nav')) {
                nav.classList.toggle('is-open');
            }

            // check if clicked elements is not nav
            if (event.target !== nav && !nav.contains(event.target) && !clickedElement.matches('.js-toggle-nav')) {
                nav.classList.remove('is-open');
            }

        }, false);
    },


    // DOM MANIPULATION
    goToSchedulePage(way) {

        var wayIndex = this.Current.Hub.findIndex(x => x.way === way);
        this.Current.Way = this.Current.Hub[wayIndex];

        this.getDayOfWeek(this.Current.Way);
        this.getNextTime(wayIndex);

        this.renderTitle();
        this.renderSchedule();
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
        this.SelectedDayOfWeek = this.Current.DayOfWeek;
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
        var attr = `[data-dayofweek="${this.SelectedDayOfWeek}"]`;
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
        this.DOM.Title.textContent = `${this.Current.Way.departure} - ${this.Current.Way.arrival}`;
    },
    renderSchedule() {
        this.DOM.Schedules.forEach((schedule, i) => {
            var html = '';
            this.Current.Way.days[i].schedule.forEach((time, j) => {
                html += `
                    <li ${time.isNext ? 'class="is-next"' : ''}>
                        <span>${time.h}:${time.m}</span>
                    </li>
                `;
            });
            this.DOM.Schedules[i].innerHTML = html;
        });
    }
}

App.init();
window.App = App;