import { MonthDisplayType } from "../../types";

export function setMonthDisplayType(monthDisplayType: MonthDisplayType) {
  this.monthDisplayType = monthDisplayType;
  this.updateMonthYear();
}

/** Invoked on month or year click */
export function handleMonthYearDisplayClick(e: any) {
  
  // Filter out unwanted click events
  if (!(
    e.target.classList.contains("calendar__month") ||
    e.target.classList.contains("calendar__year")
  )) {
    return;
  }
  // Check if MonthYear click is disabled
  if (this.disableMonthYearPickers) {
    return;
  }

  const oldPickerType = this.pickerType;
  const classList = e.target.classList;

  // Set picker type
  if (classList.contains("calendar__month")) {
    this.pickerType = 'month';
    this.monthDisplay!.style.opacity = '1';
    this.yearDisplay!.style.opacity = '0.7';
    this.pickerMonthContainer!.style.display = 'grid';
    this.pickerYearContainer!.style.display = 'none';

    // update month view:
    [].slice.call(this.pickerMonthContainer!.querySelectorAll('.calendar__picker-month-option')).forEach((element: HTMLElement, i: number) => {      
      
      const disabled = checkMonth.bind(this)(+(element.dataset.value || i));
      element.classList[disabled ? 'add' : 'remove']('disable');
      
      const isTodayMonth = this.currentDate.getFullYear() == this.today.getFullYear() && +(element.dataset.value || i) == this.today.getMonth()
      // const isTodayMonth = ['getFullYear', 'getMonth'].reduce((acc, f) => acc && (this.currentDate[f]() === this.today[f]()), true);      
      element.classList[isTodayMonth ? 'add' : 'remove']('calendar__picker-month-today')
      
    }, this);

  } else if (classList.contains("calendar__year")) {
    this.pickerType = 'year';
    this.monthDisplay!.style.opacity = '0.7';
    this.yearDisplay!.style.opacity = '1';
    this.pickerMonthContainer!.style.display = 'none';
    this.pickerYearContainer!.style.display = 'grid';
  }

  if (oldPickerType === this.pickerType) {
    // Toggle picker
    this.togglePicker();
  } else {
    // Open picker
    this.togglePicker(true);
  }
}


/***
 * @description Сhecks whether the current month is available
 */
export function checkMonth(i: number) {
  let disabled = false;
  if (this.start && this.currentDate) {
    if (this.start.getFullYear() == this.currentDate.getFullYear() && i < this.start.getMonth())
      disabled = true;
  }
  if (this.end && this.currentDate) {
    if (this.end.getFullYear() == this.currentDate.getFullYear() && i > this.end.getMonth())
      disabled = true;
  }
  return disabled;
}


export function handlePrevMonthButtonClick() {
  // Check if Month arrow click is disabled
  if (this.disableMonthArrowClick) {
    return;
  }

  const newMonthValue = this.currentDate.getMonth() - 1;
  if (this.currentDate.getFullYear() <= this.today.getFullYear() + this.yearPickerOffset - 4 && newMonthValue < 0) {
    this.yearPickerOffset -= 12;
    this.generatePickerYears();
  }
  if (newMonthValue < 0) {
    this.updateYearPickerSelection(this.currentDate.getFullYear() - 1);
  }
  this.updateMonthPickerSelection(newMonthValue);
  this.updateCurrentDate(-1);
  this.togglePicker(false);
}

export function handleNextMonthButtonClick() {
  // Check if Month arrow click is disabled
  if (this.disableMonthArrowClick) {
    return;
  }

  const newMonthValue = this.currentDate.getMonth() + 1;
  if (this.currentDate.getFullYear() >= this.today.getFullYear() + this.yearPickerOffset + 7 && newMonthValue > 11) {
    this.yearPickerOffset += 12;
    this.generatePickerYears();
  }
  if (newMonthValue > 11) {
    this.updateYearPickerSelection(this.currentDate.getFullYear() + 1);
  }
  this.updateMonthPickerSelection(newMonthValue);
  this.updateCurrentDate(1);
  this.togglePicker(false);
}

/** Update Month and Year HTML */
export function updateMonthYear() {
  this.oldSelectedNode = null;
  if (this.customMonthValues) {
    this.monthDisplay!.innerHTML = this.customMonthValues[this.currentDate.getMonth()];
  } else {
    this.monthDisplay!.innerHTML = new Intl.DateTimeFormat("default", {
      month: this.monthDisplayType,
    }).format(this.currentDate)
  }
  this.yearDisplay!.innerHTML = this.currentDate.getFullYear().toString();
}
