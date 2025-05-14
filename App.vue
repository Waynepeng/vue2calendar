<template>
  <div class="calendar">
    <div class="calendar-header">
      <h2>{{ currentYear }} 年 {{ currentMonth + 1 }} 月 {{ currentDay }} 日</h2>
      <p>农历: {{ lunarInfo.lunarMonthName }}{{ lunarInfo.lunarDayName }}</p>
      <p v-if="lunarInfo.solarTerm">{{ lunarInfo.solarTerm }}（节气）</p>
      <p v-if="holidayInfo">{{ holidayInfo }}（放假信息）</p>
    </div>
    <div class="calendar-weekdays">
      <span>日</span>
      <span>一</span>
      <span>二</span>
      <span>三</span>
      <span>四</span>
      <span>五</span>
      <span>六</span>
    </div>
    <div class="calendar-days">
      <span v-for="(day, index) in daysInMonth" :key="index" :class="{ 'other-month': day === 0 }">
        {{ day === 0 ? '' : day }}
      </span>
    </div>
  </div>
</template>

<script>
import LunarCalendar from 'lunar-calendar';

export default {
  data() {
    return {
      currentDate: new Date(),
      holidayData: {
        '2025-05-01': '劳动节',
        '2025-06-22': '端午节'
        // 可以添加更多放假信息
      }
    };
  },
  computed: {
    currentYear() {
      return this.currentDate.getFullYear();
    },
    currentMonth() {
      return this.currentDate.getMonth();
    },
    currentDay() {
      return this.currentDate.getDate();
    },
    daysInMonth() {
      const firstDay = new Date(this.currentYear, this.currentMonth, 1);
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
      const days = [];
      const startDay = firstDay.getDay();
      for (let i = 0; i < startDay; i++) {
        days.push(0);
      }
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(i);
      }
      return days;
    },
    lunarInfo() {
      const lunar = LunarCalendar.solar2lunar(this.currentYear, this.currentMonth + 1, this.currentDay);
      return lunar;
    },
    holidayInfo() {
      const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(this.currentDay).padStart(2, '0')}`;
      return this.holidayData[dateStr];
    }
  },
  methods: {
    prevMonth() {
      this.currentDate = new Date(this.currentYear, this.currentMonth - 1, 1);
    },
    nextMonth() {
      this.currentDate = new Date(this.currentYear, this.currentMonth + 1, 1);
    }
  }
};
</script>

<style scoped>
.calendar {
  width: 300px;
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
}

.calendar-header {
  margin-bottom: 10px;
}

.calendar-weekdays {
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.other-month {
  color: #ccc;
}
</style>  