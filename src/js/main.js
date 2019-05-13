
import data from '../data/data.json';

const App = {
    Data: data,
    Now: new Date(),
    //Now: new Date(2019, 5-1, 4, 23, 0),
    //Now: new Date(2019, 5-1, 5, 0, 1),
    //Now: new Date(2019, 5-1, 5, 3, 0),
    Holidays: [],

    PageId: null,

    CurrentDayOfWeek: '',

    Current: {
        Hub: null,
        Way: null,
        Schedule: null,
        DayOfWeek: '',
        IsYesterday: null,
        IsToday: null,
        IsTomorrow: null
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

        this.goToDefaultPage();

        // get data
        //this.getHolidays();
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
    getHolidays() {
        var vm = this;
        var Http = new XMLHttpRequest();
        var url = `http://services.sapo.pt/Holiday/GetNationalHolidays?year=${this.Now.getFullYear()}`;
        Http.open('GET', url);
        Http.send();
        Http.onreadystatechange = (e) => {
            if (Http.responseText) {
                vm.Holidays = new DOMParser().parseFromString(Http.responseText, "text/xml");
                console.log(vm.Holidays.getElementsByTagName("Holiday")[0].querySelector("Date")/* .nodeValue */);
            }
        }
    },
    getDayOfWeek(way) {

        /* Objective: get the following times, to make the if's:
             - yesterday's last time
             - today's first time
             - today's last time
        */

        // Get weekdays ===========================

        // get yesterday's weekday
        var yesterday = new Date(this.Now); yesterday.setDate(yesterday.getDate() - 1);
        var yesterdayWeekday = this.getWeekday(yesterday);

        // get today's weekday
        var weekday = this.getWeekday(this.Now);

        // get tomorrow's weekday
        var tomorrow = new Date(this.Now); tomorrow.setDate(tomorrow.getDate() + 1);
        var tomorrowWeekday = this.getWeekday(tomorrow);


        // Get schedules ===========================

        // get yesterday's schedule
        var yesterdaySchedule = way.days.find(x => x.day == yesterdayWeekday).schedule;

        // get today's schedule
        var schedule = way.days.find(x => x.day == weekday).schedule;


        // Get dateTimes ===========================

        // get yesterday's last dateTime
        var yesterdayLastArrayTime = yesterdaySchedule[yesterdaySchedule.length - 1];
        var yesterdayLastTime = yesterdayLastArrayTime.am ? new Date(this.Now) : new Date(yesterday); // check if yesterday's last time is after midnight and set day according that (yesterday or today) - (am === after midnight)
        yesterdayLastTime.setHours(yesterdayLastArrayTime.h, yesterdayLastArrayTime.m, 0);

        // get today's first dateTime
        var firstArrayTime = schedule[0];
        var firstTime = new Date(this.Now);
        firstTime.setHours(firstArrayTime.h, firstArrayTime.m, 0);

        // get today's last dateTime
        var lastArrayTime = schedule[schedule.length - 1];
        var lastTime = lastArrayTime.am ? new Date(tomorrow) : new Date(this.Now); // check if today's last time is after midnight and set day according that (today or tomorrow) - (am === after midnight)
        lastTime.setHours(lastArrayTime.h, lastArrayTime.m, 0);


        // check if now is in yesterday's schedule
        var now = this.Now.getTime();
        if (now > yesterdayLastTime.getTime() && now < lastTime.getTime()) {

            // set weekday and schedule as today
            this.Current.DayOfWeek = weekday;
            this.Current.Schedule = schedule;
            this.SelectedDayOfWeek = weekday;
            this.Current.IsToday = true;
        }
        else {

            if (now < firstTime.getTime()) {

                // set weekday and schedule as yesterday
                this.Current.DayOfWeek = yesterdayWeekday;
                this.Current.Schedule = yesterdaySchedule;
                this.SelectedDayOfWeek = yesterdayWeekday;
                this.Current.IsYesterday = true;
            }
            else {

                // case: when last time is before midnight and now it's after that

                // get tomorrow's schedule
                var tomorrowSchedule = way.days.find(x => x.day == tomorrowWeekday).schedule;

                // set weekday and schedule as tomorrow
                this.Current.DayOfWeek = tomorrowWeekday;
                this.Current.Schedule = tomorrowSchedule;
                this.SelectedDayOfWeek = tomorrowWeekday;
                this.Current.IsTomorrow = true;
            }

        }
    },
    getNextTime(index) {

        console.log(this.Current.DayOfWeek);

        this.Current.Schedule.find(time => {

            // build dateTime based on time
            var dateTime = new Date(this.Now);
            dateTime.setHours(time.h, time.m, 0); // time of schedule


            // Day fix ================
            if (this.Current.IsYesterday && !time.am) // next time is before midnight
                dateTime.setDate(dateTime.getDate() - 1) // set as yesterday

            if (this.Current.IsTomorrow) // next time is tomorrow
                dateTime.setDate(dateTime.getDate() + 1) // set as tomorrow

            if (this.Current.IsToday && time.am) // schedule is from today, but next time is after midnight
                dateTime.setDate(dateTime.getDate() + 1) // set as tomorrow
            


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
            else if (event.target.matches('.js-nav-link')) {
                this.goToHub(event.target);
            }

            // check if clicked elements is not nav
            if (event.target !== nav && !nav.contains(event.target) && !clickedElement.matches('.js-toggle-nav')) {
                nav.classList.remove('is-open');
            }

        }, false);

        // on back button
        var app = this;
        window.location.hash = '#inicio'; // set default hash
        window.addEventListener('hashchange', (e) => {
            if (window.location.hash === '#inicio') {
                app.goToHomePage();
            }
            else if (window.location.hash === '#horario') {
                app.showSchedulePage();
            }
        });
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

        this.showSchedulePage();

        this.scrollToCurrentTime();

        window.location.hash = 'horario';
    },
    showSchedulePage() {
        // close Home page tab
        this.DOM.Pages.Home.setAttribute("aria-hidden", true);

        // open Schedule page
        this.DOM.Pages.Schedule.classList.add("is-active");
        this.DOM.Pages.Schedule.setAttribute("aria-hidden", false);
    },
    goToHomePage() {
        this.DOM.Pages.Home.setAttribute("aria-hidden", false);

        this.DOM.Pages.Schedule.classList.remove("is-active");
        this.DOM.Pages.Schedule.setAttribute("aria-hidden", true);

        // reset tab selection
        this.SelectedDayOfWeek = this.Current.DayOfWeek;

        window.location.hash = 'inicio';
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
    },

    // NAVIGATION

    goToDefaultPage() {
        var hub = localStorage.getItem('hub'); // get default page
        if(hub && hub !== this.PageId) { // check if current page is not the default page
            var url = (hub) ? `${hub}.html` : '';
            window.location = './' + url;
        }
    },
    goToHub(btn) {
        var hub = btn.dataset.target;

        // save default page to localstorage
        localStorage.setItem('hub', hub);
        
        // go to page
        var url = (hub) ? `${hub}.html` : '';
        window.location = './' + url;
    }
}

App.init();
window.App = App;