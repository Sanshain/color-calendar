import { addEventListeners } from "./modules/addEventListeners";
import { configureStylePreferences } from "./modules/stylePreference";
import * as picker from "./modules/picker/picker";
import * as monthPicker from "./modules/picker/month/monthPicker";
import * as yearPicker from "./modules/picker/year/yearPicker";
import * as header from "./modules/header/header";
import * as weekday from "./modules/weekday/weekday";
import * as day from "./modules/day/day";
import * as events from "./modules/events/events";

import {
  CalendarSize,
  LayoutModifier,
  CalendarOptions,
  EventData,
  Day,
  MonthDisplayType,
  WeekdayDisplayType,
  Weekdays,
  StartWeekday,
} from "./types.d";

export default class Calendar {
  /* Constants */
  readonly CAL_NAME = 'color-calendar';
  readonly DAYS_TO_DISPLAY = 42;

  /* Options */
  id: string;
  start?: Date;
  end?: Date;
  selectInitialDate?: boolean;
  calendarSize: CalendarSize;
  layoutModifiers: LayoutModifier[];
  eventsData: EventData[];
  theme: string;
  primaryColor?: string;
  headerColor?: string;
  headerBackgroundColor?: string;
  weekdaysColor?: string;
  weekdayDisplayType: WeekdayDisplayType;
  monthDisplayType: MonthDisplayType;
  startWeekday: StartWeekday;
  fontFamilyHeader?: string;
  fontFamilyWeekdays?: string;
  fontFamilyBody?: string;
  dropShadow?: string;
  border?: string;
  borderRadius?: string;
  disableMonthYearPickers: boolean;
  disableDayClick: boolean;
  disableMonthArrowClick: boolean;
  customMonthValues?: string[];
  customWeekdayValues?: string[];
  monthChanged?: (currentDate?: Date, filteredMonthEvents?: EventData[]) => void;
  dateChanged?: (currentDate?: Date, filteredDateEvents?: EventData[]) => void;
  selectedDateClicked?: (currentDate?: Date, filteredDateEvents?: EventData[]) => void;

  /* State */
  weekdayDisplayTypeOptions = {
    "short": ["S", "M", "T", "W", "T", "F", "S"] as Weekdays,
    "long-lower": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as Weekdays,
    "long-upper": ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as Weekdays,
  }
  weekdays: Weekdays;
  today: Date;
  currentDate: Date;  
  pickerType: string;
  eventDayMap: any;
  oldSelectedNode: [HTMLElement, number] | null;
  filteredEventsThisMonth: EventData[];
  daysIn_PrevMonth: Day[];
  daysIn_CurrentMonth: Day[];
  daysIn_NextMonth: Day[];
  firstDay_PrevMonth: StartWeekday;
  firstDay_CurrentMonth: StartWeekday;
  firstDay_NextMonth: StartWeekday;
  numOfDays_PrevMonth: number;
  numOfDays_CurrentMonth: number;
  numOfDays_NextMonth: number;
  yearPickerOffset: number;
  yearPickerOffsetTemporary: number;

  /* Elements */
  calendar: HTMLElement;
  calendarRoot: HTMLElement;
  calendarHeader: HTMLElement;
  calendarWeekdays: HTMLElement;
  calendarDays: HTMLElement;
  prevButton: HTMLElement;
  nextButton: HTMLElement;
  pickerContainer: HTMLElement;
  pickerMonthContainer: HTMLElement;
  pickerYearContainer: HTMLElement;
  yearPickerChevronLeft: HTMLElement;
  yearPickerChevronRight: HTMLElement;
  monthyearDisplay: HTMLElement;
  monthDisplay: HTMLElement;
  yearDisplay: HTMLElement;

  /* Methods */
  // Event Listeners
  addEventListeners!: () => void;
  // Style Preference
  configureStylePreferences!: () => void;
  // Picker
  togglePicker!: (shouldOpen?: boolean) => void;
  // Picker - Month
  handleMonthPickerClick!: (e: any) => void;
  updateMonthPickerSelection!: (newMonthValue: number) => void;
  removeMonthPickerSelection!: () => void;
  // Picker - Year
  handleYearPickerClick!: (e: any) => void;
  updateYearPickerSelection!: (newYearValue: number, newYearIndex?: number) => void;
  updateYearPickerTodaySelection!: () => void;
  removeYearPickerSelection!: () => void;
  generatePickerYears!: () => void;
  handleYearChevronLeftClick!: () => void;
  handleYearChevronRightClick!: () => void;
  // Header
  setMonthDisplayType!: (monthDisplayType: MonthDisplayType) => void;
  handleMonthYearDisplayClick!: (e: any) => void;
  handlePrevMonthButtonClick!: () => void;
  handleNextMonthButtonClick!: () => void;
  updateMonthYear!: () => void;
  // Weekday
  setWeekdayDisplayType!: (weekdayDisplayType: WeekdayDisplayType) => void;
  generateWeekdays!: () => void;
  // Day
  setDate!: (date: Date) => void;
  getSelectedDate!: () => Date;
  clearCalendarDays!: () => void;
  updateCalendar!: (isMonthChanged?: boolean) => void;
  setOldSelectedNode!: () => void;
  selectDayInitial!: (setDate?: boolean) => void;
  handleCalendarDayClick!: (e: any) => void;
  removeOldDaySelection!: () => void;
  updateCurrentDate!: (monthOffset: number, newDay?: number, newMonth?: number, newYear?: number) => void;
  generateDays!: () => void;
  renderDays!: () => void;
  rerenderSelectedDay!: (element: HTMLElement, dayNum: number, storeOldSelected?: boolean) => void;
  // Methods
  getEventsData!: () => any;
  setEventsData!: (events: EventData[]) => number;
  addEventsData!: (newEvents?: EventData[]) => number;
  getDateEvents!: (date: Date) => EventData[];
  getMonthEvents!: () => EventData[];
  stepInfo = {
    next: {
      year: true,
      month: true
    },
    previous: {
      year: true,
      month: true
    }
  };

  constructor(options: CalendarOptions = {}) {
    /* Initialize Options */
    this.id = options.id ?? "#color-calendar";
    this.selectInitialDate = options.selectInitialDate ?? true;
    this.calendarSize = (options.calendarSize ?? "large") as CalendarSize;
    this.layoutModifiers = options.layoutModifiers ?? [];
    this.eventsData = options.eventsData ?? [];
    this.theme = options.theme ?? "basic";
    this.primaryColor = options.primaryColor;
    this.headerColor = options.headerColor;
    this.headerBackgroundColor = options.headerBackgroundColor;
    this.weekdaysColor = options.weekdaysColor;
    this.weekdayDisplayType = (options.weekdayDisplayType ?? "long-lower") as WeekdayDisplayType;
    this.monthDisplayType = (options.monthDisplayType ?? "long") as MonthDisplayType;
    this.startWeekday = options.startWeekday ?? 0; // 0 (Sun), 1 (Mon), 2 (Tues), 3 (Wed), 4 (Thu), 5 (Fri), 6 (Sat)
    this.fontFamilyHeader = options.fontFamilyHeader;
    this.fontFamilyWeekdays = options.fontFamilyWeekdays;
    this.fontFamilyBody = options.fontFamilyBody;
    this.dropShadow = options.dropShadow;
    this.border = options.border;
    this.borderRadius = options.borderRadius;
    this.disableMonthYearPickers = options.disableMonthYearPickers ?? false;
    this.disableDayClick = options.disableDayClick ?? false;
    this.disableMonthArrowClick = options.disableMonthArrowClick ?? false;
    this.customMonthValues = options.customMonthValues;
    this.customWeekdayValues = options.customWeekdayValues;
    this.monthChanged = options.monthChanged;
    this.dateChanged = options.dateChanged;
    this.selectedDateClicked = options.selectedDateClicked;

    /* Initialize State */
    if (this.customWeekdayValues && this.customWeekdayValues.length === 7) {
      this.weekdays = this.customWeekdayValues as Weekdays;
    } else {
      this.weekdays = this.weekdayDisplayTypeOptions[this.weekdayDisplayType] ?? this.weekdayDisplayTypeOptions["short"];
    }
    this.today = new Date();
    this.currentDate = options.currentDate || new Date();

    // TODO range:        
    // this.range: days number [-7, 7]
    
    this.start = options.startMonth ? new Date(options.startMonth.getFullYear(), options.startMonth.getMonth() - 1, 1) : undefined    
    this.end = options.endMonth ? new Date(options.endMonth.getFullYear(), options.endMonth.getMonth(), 0) : undefined

    if (this.start && (this.start > this.currentDate)) throw new Error('The current date cannot be less than the starting point')
    if (this.end && (this.end < this.currentDate)) throw new Error('The current date cannot be greater than the endpoint');

    ['start', 'end'].forEach((it: string) => {
      const prop = it as keyof Calendar;
      if (this[prop]) {
        if (this.currentDate.getFullYear() == this[prop].getFullYear()) {
          const switchKey = prop == 'start' ? 'previous' : 'next';

          this.stepInfo[switchKey].year = false          

          if (this.currentDate.getMonth() == this[prop].getMonth()) this.stepInfo[switchKey].month = false
        }
      }
    }, this)        
  

    this.pickerType = 'month';
    this.eventDayMap = {};
    this.oldSelectedNode = null;
    this.filteredEventsThisMonth = [];
    this.daysIn_PrevMonth = [];
    this.daysIn_CurrentMonth = [];
    this.daysIn_NextMonth = [];
    this.firstDay_PrevMonth = 0;
    this.firstDay_CurrentMonth = 0;
    this.firstDay_NextMonth = 0;
    this.numOfDays_PrevMonth = 0;
    this.numOfDays_CurrentMonth = 0;
    this.numOfDays_NextMonth = 0;
    this.yearPickerOffset = 0;
    this.yearPickerOffsetTemporary = 0;

    // Check if HTML element with given selector exists in DOM
    this.calendar = document.querySelector(this.id) as HTMLElement;
    if (!this.calendar) {
      throw new Error(`[COLOR-CALENDAR] Element with selector '${this.id}' not found`);
    }

    // Initialize initial HTML layout
    this.calendar.innerHTML = `
      <div class="${this.CAL_NAME} ${this.theme} color-calendar--${this.calendarSize}">
        <div class="calendar__header">
          <div class="calendar__arrow calendar__arrow-prev ${this.stepInfo.previous.month ? '' : 'disable'}"><div class="calendar__arrow-inner"></div></div>
          <div class="calendar__monthyear">
            <span class="calendar__month"></span>&nbsp;
            <span class="calendar__year"></span>
          </div>
          <div class="calendar__arrow calendar__arrow-next ${this.stepInfo.next.month ? '' : 'disable'}"><div class="calendar__arrow-inner"></div></div>
        </div>
        <div class="calendar__body">
          <div class="calendar__weekdays"></div>
          <div class="calendar__days"></div>
          <div class="calendar__picker">
            <div class="calendar__picker-month">
              ${(this.customMonthValues ?? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']).map((month, i) => {
                let disabled = ''
                if (this.start && this.currentDate) {
                  if (this.start.getFullYear() == this.currentDate.getFullYear() && i < this.start.getMonth()) disabled = ' disable'
                }
                if (this.end && this.currentDate) {
                  if (this.end.getFullYear() == this.currentDate.getFullYear() && i > this.end.getMonth()) disabled = ' disable'
                }
                return `<div class="calendar__picker-month-option${disabled}" data-value="${i}">${month}</div>`
              }).join('')}
            </div>
            <div class="calendar__picker-year">
              ${new Array(12).fill(0).map((_, i) => {
                return `<div class="calendar__picker-year-option" data-value="${i}"></div>`
              }).join('')}
              <div class="calendar__picker-year-arrow calendar__picker-year-arrow-left">
                <div class="chevron-thin chevron-thin-left"></div>
              </div>
              <div class="calendar__picker-year-arrow calendar__picker-year-arrow-right">
                <div class="chevron-thin chevron-thin-right"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Store HTML element references
    this.calendarRoot = document.querySelector(`${this.id} .${this.CAL_NAME}`) as HTMLElement;
    this.calendarHeader = document.querySelector(`${this.id} .calendar__header`) as HTMLElement;
    this.calendarWeekdays = document.querySelector(`${this.id} .calendar__weekdays`) as HTMLElement;
    this.calendarDays = document.querySelector(`${this.id} .calendar__days`) as HTMLElement;
    this.pickerContainer = document.querySelector(`${this.id} .calendar__picker`) as HTMLElement;
    this.pickerMonthContainer = document.querySelector(`${this.id} .calendar__picker-month`) as HTMLElement;
    this.pickerYearContainer = document.querySelector(`${this.id} .calendar__picker-year`) as HTMLElement;
    this.yearPickerChevronLeft = document.querySelector(`${this.id} .calendar__picker-year-arrow-left`) as HTMLElement;
    this.yearPickerChevronRight = document.querySelector(`${this.id} .calendar__picker-year-arrow-right`) as HTMLElement;

    // Mark today's month in month picker
    this.pickerMonthContainer!.children[this.today.getMonth()].classList.add('calendar__picker-month-today');

    // Apply Layout Modifiers
    this.layoutModifiers.forEach(item => {
      this.calendarRoot.classList.add(item);
    });

    // Shifts month and year header UI to be left aligned
    if (this.layoutModifiers.includes('month-left-align')) {
      this.calendarHeader.innerHTML = `
        <div class="calendar__monthyear">
          <span class="calendar__month"></span>&nbsp;
          <span class="calendar__year"></span>
        </div>
        <div class="calendar__arrow calendar__arrow-prev"><div class="calendar__arrow-inner ${this.stepInfo.previous.month ? '' : 'disable'}"></div></div>
        <div class="calendar__arrow calendar__arrow-next"><div class="calendar__arrow-inner ${this.stepInfo.next.month ? '' : 'disable'}"></div></div>
      `
    }

    this.monthyearDisplay = document.querySelector(`${this.id} .calendar__monthyear`) as HTMLElement;
    this.monthDisplay = document.querySelector(`${this.id} .calendar__month`) as HTMLElement;
    this.yearDisplay = document.querySelector(`${this.id} .calendar__year`) as HTMLElement;
    this.prevButton = document.querySelector(`${this.id} .calendar__arrow-prev .calendar__arrow-inner`) as HTMLElement;
    this.nextButton = document.querySelector(`${this.id} .calendar__arrow-next .calendar__arrow-inner`) as HTMLElement;

    // Set initial picker styles
    this.togglePicker(false);

    // Set CSS Variables based on options given
    this.configureStylePreferences();

    // Apply click listeners to HTML elements
    this.addEventListeners();

    this.reset(this.currentDate);
  }

  reset(date: Date) {
    this.currentDate = date ? date : new Date();
    this.clearCalendarDays();
    this.updateMonthYear();
    this.updateMonthPickerSelection(this.currentDate.getMonth());
    this.generatePickerYears();
    this.updateYearPickerSelection(this.currentDate.getFullYear(), 4);
    this.updateYearPickerTodaySelection();
    this.generateWeekdays();  // TODO: rename to generateAndRenderWeekdays
    this.generateDays();
    this.selectDayInitial(date ? true : false);
    this.renderDays();
    this.setOldSelectedNode();  // TODO: rename to setOldSelectedDay
    if (this.dateChanged) {
      this.dateChanged(this.currentDate, this.getDateEvents(this.currentDate));
    }
    if (this.monthChanged) {
      this.monthChanged(this.currentDate, this.getMonthEvents());
    }
  }

}

/* Methods */
// Add Event Listeners
Calendar.prototype.addEventListeners = addEventListeners;
// Style Preference
Calendar.prototype.configureStylePreferences = configureStylePreferences;
// Picker
Calendar.prototype.togglePicker = picker.togglePicker;
// Picker - Month
Calendar.prototype.handleMonthPickerClick = monthPicker.handleMonthPickerClick;
Calendar.prototype.updateMonthPickerSelection = monthPicker.updateMonthPickerSelection;
Calendar.prototype.removeMonthPickerSelection = monthPicker.removeMonthPickerSelection;
// Picker - Year
Calendar.prototype.handleYearPickerClick = yearPicker.handleYearPickerClick;
Calendar.prototype.updateYearPickerSelection = yearPicker.updateYearPickerSelection;
Calendar.prototype.updateYearPickerTodaySelection = yearPicker.updateYearPickerTodaySelection;
Calendar.prototype.removeYearPickerSelection = yearPicker.removeYearPickerSelection;
Calendar.prototype.generatePickerYears = yearPicker.generatePickerYears;
Calendar.prototype.handleYearChevronLeftClick = yearPicker.handleYearChevronLeftClick;
Calendar.prototype.handleYearChevronRightClick = yearPicker.handleYearChevronRightClick;
// Header
Calendar.prototype.setMonthDisplayType = header.setMonthDisplayType;
Calendar.prototype.handleMonthYearDisplayClick = header.handleMonthYearDisplayClick;
Calendar.prototype.handlePrevMonthButtonClick = header.handlePrevMonthButtonClick;
Calendar.prototype.handleNextMonthButtonClick = header.handleNextMonthButtonClick;
Calendar.prototype.updateMonthYear = header.updateMonthYear;
// Weekday
Calendar.prototype.setWeekdayDisplayType = weekday.setWeekdayDisplayType;
Calendar.prototype.generateWeekdays = weekday.generateWeekdays;
// Day
Calendar.prototype.setDate = day.setDate;
Calendar.prototype.getSelectedDate = day.getSelectedDate;
Calendar.prototype.clearCalendarDays = day.clearCalendarDays;
Calendar.prototype.updateCalendar = day.updateCalendar;
Calendar.prototype.setOldSelectedNode = day.setOldSelectedNode;
Calendar.prototype.selectDayInitial = day.selectDayInitial;
Calendar.prototype.handleCalendarDayClick = day.handleCalendarDayClick;
Calendar.prototype.removeOldDaySelection = day.removeOldDaySelection;
Calendar.prototype.updateCurrentDate = day.updateCurrentDate;
Calendar.prototype.generateDays = day.generateDays;
Calendar.prototype.renderDays = day.renderDays;
Calendar.prototype.rerenderSelectedDay = day.rerenderSelectedDay;
// Methods
Calendar.prototype.getEventsData = events.getEventsData;
Calendar.prototype.setEventsData = events.setEventsData;
Calendar.prototype.addEventsData = events.addEventsData;
Calendar.prototype.getDateEvents = events.getDateEvents;
Calendar.prototype.getMonthEvents = events.getMonthEvents;
