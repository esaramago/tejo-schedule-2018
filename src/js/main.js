
import data from '../data/data.json';

const App = {
    Data: data,
    Now: new Date(),
    //Now: new Date(2019, 5-1, 2, 6, 10),
    PageId: null,

    Schedules: null,
    CurrentWay: null,
    CurrentSchedule: null,
    CurrentDayOfWeek: '',

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

    selectedDayOfWeek: null, // selected tab

    init() {

        // Settings
        this.PageId = document.body.dataset.pageId;
        this.Schedules = this.Data[this.PageId];

        this.Schedules.forEach((way, index) => {
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
        firstTime.setHours(schedule[0].hour, schedule[0].minute, 0);

        // get yesterday's last dateTime based on array time
        var yesterday = new Date(this.Now); yesterday.setDate(yesterday.getDate() - 1);
        var yesterdayWeekday = this.getWeekday(yesterday); // get weekday
        var yesterdaySchedule = way.days.find(x => x.day == yesterdayWeekday).schedule; // get yesterday's schedule
        var yesterdayLastArrayTime = yesterdaySchedule[yesterdaySchedule.length - 1];
        var yesterdayLastTime = new Date(yesterday);
        yesterdayLastTime.setHours(yesterdayLastArrayTime.hour, yesterdayLastArrayTime.minute, 0);

        if (this.Now.getTime() < yesterdayLastTime.getTime()) { // check if now is in yesterday's schedule
            weekday = yesterdayWeekday;
            schedule = yesterdaySchedule;
        }
        this.CurrentDayOfWeek = weekday;
        this.CurrentSchedule = schedule;
        this.selectedDayOfWeek = weekday;

    },
    getNextTime(index) {

        this.CurrentSchedule.find(time => {

            // build dateTime based on time
            var now = new Date(this.Now);
            var dateTime = new Date(this.Now); // time of schedule
            dateTime.setHours(time.hour, time.minute, 0);

            if (now.getHours() < 5 && dateTime.getHours() >= 5) { // ToDo: alterar 5 para último horário 
                dateTime.setDate(dateTime.getDate() - 1); // set tomorrow
            }

            // check if it's next
            if (dateTime.getTime() > now.getTime()) {

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

        var wayIndex = this.Schedules.findIndex(x => x.way === way);
        this.CurrentWay = this.Schedules[wayIndex];

        this.getDayOfWeek(this.CurrentWay);
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
        this.DOM.Title.textContent = `${this.CurrentWay.departure} - ${this.CurrentWay.arrival}`;
    },
    renderSchedule() {
        this.DOM.Schedules.forEach((schedule, i) => {
            var html = '';
            this.CurrentWay.days[i].schedule.forEach((time, j) => {
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