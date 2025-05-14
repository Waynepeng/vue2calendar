<template>
  <div class="calendar">
    <h1 class="calendar-title">企业工作日历</h1>
    <div class="calendar-header">
      <select v-model="currentYear">
        <option v-for="year in years" :value="year" :key="year">{{ year }}年</option>
      </select>&nbsp;
      <select v-model="currentMonth">
        <option v-for="month in months" :value="month - 1" :key="month">{{ month }}月</option>
      </select>
    </div>
    <div class="calendar-weekdays">
      <span>一</span>
      <span>二</span>
      <span>三</span>
      <span>四</span>
      <span>五</span>
      <span>六</span>
      <span>日</span>
    </div>
    <div class="calendar-days">
      <div
        v-for="(day, index) in daysInMonth"
        :key="index"
        class="calendar-day"
        :class="{
          'other-month': day === 0,
          'holiday': isHoliday(currentYear, currentMonth + 1, day),
          'weekend': isWeekend(currentYear, currentMonth + 1, day),
          'company-holiday': isCompanyHoliday(currentYear, currentMonth + 1, day),
          'replace-day': isReplaceDay(currentYear, currentMonth + 1, day),
          'national-holiday': isNationalHoliday(currentYear, currentMonth + 1, day),
          'today': isToday(currentYear, currentMonth + 1, day),
          'solar-term-day': getSolarTerm(currentYear, currentMonth + 1, day)
        }"
        @click="showLunarInfo(currentYear, currentMonth + 1, day)"
        @mouseover="showLunarInfoOnHover(currentYear, currentMonth + 1, day)"
        @mouseout="hideLunarInfoOnHover"
      >
        <div class="solar-date">
          {{ day === 0? '' : day }}
        </div>
        <div class="lunar-date">
          {{ day === 0? '' : getLunarDayName(currentYear, currentMonth + 1, day) }}
        </div>
        <div v-if="day !== 0 && getSolarTerm(currentYear, currentMonth + 1, day)" class="solar-term">
          {{ getSolarTerm(currentYear, currentMonth + 1, day) }}
        </div>
        <!-- 鼠标悬停提示 -->
        <div v-if="showHoverInfo && hoverDay === day" class="tooltip">
          <div class="tooltip-content">
            <p>{{ currentYear }}年{{ currentMonth + 1 }}月{{ day }}日</p>
            <p>{{ hoverLunarInfo.lunarMonthName }}月{{ hoverLunarInfo.lunarDayName }}</p>
            <p v-if="hoverLunarInfo.solarTerm">{{ hoverLunarInfo.solarTerm }}（节气）</p>
            <p v-if="isHoliday(currentYear, currentMonth + 1, day) || isCompanyHoliday(currentYear, currentMonth + 1, day) || isReplaceDay(currentYear, currentMonth + 1, day)">
              {{ getHolidayName(currentYear, currentMonth + 1, day) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Lunar from 'lunar-javascript';

export default {
  data() {
    return {
      currentDate: new Date(),
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      holidayData: {
        '2025-01-01': '国家法定假日',
        '2025-01-27': '公司年假',
        '2025-01-28': '国家法定假日',
        '2025-01-29': '国家法定假日',
        '2025-01-30': '国家法定假日',
        '2025-02-03': '公司年假',
        '2025-02-04': '公司年假',
        '2025-04-04': '国家法定假日',
        '2025-05-01': '国家法定假日',
        '2025-05-02': '国家法定假日',
        '2025-05-31': '国家法定假日',
        '2025-05-05': '公司年假',
        '2025-06-02': '周末休假替换日',
        '2025-10-01': '国家法定假日',
        '2025-10-02': '国家法定假日',
        '2025-10-03': '国家法定假日',
        '2025-10-06': '国家法定假日',
        '2025-10-07': '公司年假',
        '2025-10-08': '公司年假',
        '2025-10-09': '公司年假'
      },
      years: [],
      months: [],
      lunarInfoCache: {},
      // 2025年节气数据（确保完整性）
      solarTerms2025: [
        { name: '小寒', date: '2025-01-05' },
        { name: '大寒', date: '2025-01-20' },
        { name: '立春', date: '2025-02-04' },
        { name: '雨水', date: '2025-02-19' },
        { name: '惊蛰', date: '2025-03-05' },
        { name: '春分', date: '2025-03-20' },
        { name: '清明', date: '2025-04-04' },
        { name: '谷雨', date: '2025-04-19' },
        { name: '立夏', date: '2025-05-05' },
        { name: '小满', date: '2025-05-20' },
        { name: '芒种', date: '2025-06-05' },
        { name: '夏至', date: '2025-06-21' },
        { name: '小暑', date: '2025-07-07' },
        { name: '大暑', date: '2025-07-22' },
        { name: '立秋', date: '2025-08-07' },
        { name: '处暑', date: '2025-08-23' },
        { name: '白露', date: '2025-09-07' },
        { name: '秋分', date: '2025-09-23' },
        { name: '寒露', date: '2025-10-08' },
        { name: '霜降', date: '2025-10-23' },
        { name: '立冬', date: '2025-11-07' },
        { name: '小雪', date: '2025-11-22' },
        { name: '大雪', date: '2025-12-07' },
        { name: '冬至', date: '2025-12-21' }
      ],
      showHoverInfo: false,
      hoverLunarInfo: {},
      hoverDay: null,
      hoverTimer: null // 新增定时器变量
    };
  },
  computed: {
    daysInMonth() {
      const firstDay = new Date(this.currentYear, this.currentMonth, 1);
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
      const days = [];
      const startDay = firstDay.getDay();
      // 调整起始偏移，以匹配周一到周日的顺序
      const adjustedStartDay = startDay === 0? 6 : startDay - 1;
      for (let i = 0; i < adjustedStartDay; i++) {
        days.push(0);
      }
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(i);
      }
      return days;
    },
  },
  methods: {
    // 日期类型判断方法
    isHoliday(year, month, day) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return this.holidayData[dateStr] === '国家法定假日';
    },
    isWeekend(year, month, day) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6;
    },
    isCompanyHoliday(year, month, day) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return this.holidayData[dateStr] === '公司年假';
    },
    isReplaceDay(year, month, day) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return this.holidayData[dateStr] === '周末休假替换日';
    },
    isNationalHoliday(year, month, day) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return this.holidayData[dateStr] === '国家法定假日';
    },
    isToday(year, month, day) {
      const now = new Date();
      return year === now.getFullYear() && month === now.getMonth() + 1 && day === now.getDate();
    },
    
    // 获取农历信息，添加缓存机制
    getLunarInfo(year, month, day) {
      const cacheKey = `${year}-${month}-${day}`;
      
      // 检查缓存
      if (this.lunarInfoCache[cacheKey]) {
        return this.lunarInfoCache[cacheKey];
      }
      
      try {
        if (day === 0) return null;
        
        // 确保 Lunar 库正确加载
        if (!Lunar || !Lunar.Solar) {
          console.error('Lunar 库或 Solar 类未正确加载');
          return { lunarMonthName: '未知', lunarDayName: '未知', solarTerm: null };
        }
        
        // 使用正确的方式创建 Solar 对象
        const solar = Lunar.Solar.fromYmd(year, month, day);
        const lunar = solar.getLunar();
        
        // 获取节气信息 - 优先使用库方法
        let solarTerm = null;
        
        // 尝试不同的API获取节气信息
        if (typeof lunar.getSolarTerm === 'function') {
          solarTerm = lunar.getSolarTerm();
        } else if (typeof lunar.getJieQi === 'function') {
          const jieQi = lunar.getJieQi();
          solarTerm = jieQi && jieQi.name? jieQi.name : null;
        } else if (typeof lunar.getTerm === 'function') {
          solarTerm = lunar.getTerm();
        }
        
        // 如果库方法无法获取节气，使用预定义数据
        if (!solarTerm) {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const termData = this.solarTerms2025.find(term => term.date === dateStr);
          solarTerm = termData? termData.name : null;
        }
        
        const result = {
          lunarMonthName: lunar.getMonthInChinese(),
          lunarDayName: lunar.getDayInChinese(),
          solarTerm: solarTerm
        };
        
        // 存入缓存
        this.lunarInfoCache[cacheKey] = result;
        
        return result;
      } catch (error) {
        console.error(`获取 ${year} 年 ${month} 月 ${day} 日的农历信息时出错:`, error);
        return { lunarMonthName: '未知', lunarDayName: '未知', solarTerm: null };
      }
    },
    
    // 获取农历日期名称（不包含节气）
    getLunarDayName(year, month, day) {
      const lunar = this.getLunarInfo(year, month, day);
      if (!lunar) return '';
      
      // 如果是初一，显示完整月份+日期
      if (lunar.lunarDayName === '初一') {
        return `${lunar.lunarMonthName}初一`;
      }
      
      // 只显示农历日期
      return lunar.lunarDayName;
    },
    
    // 获取某一天的节气信息
    getSolarTerm(year, month, day) {
      const lunar = this.getLunarInfo(year, month, day);
      return lunar? lunar.solarTerm : null;
    },
    
    // 获取节假日名称
    getHolidayName(year, month, day) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return this.holidayData[dateStr] || '';
    },
    
    // 显示农历信息
    showLunarInfo(year, month, day) {
      if (day > 0) {
        const lunar = this.getLunarInfo(year, month, day);
        const lunarInfo = `${lunar.lunarMonthName}${lunar.lunarDayName}`;
        const solarTerm = lunar.solarTerm? `（${lunar.solarTerm}）` : '';
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const holiday = this.holidayData[dateStr]? `（${this.holidayData[dateStr]}）` : '';
        alert(`${year} 年 ${month} 月 ${day} 日 的农历信息：${lunarInfo}${solarTerm}${holiday}`);
      }
    },
    
    // 鼠标悬停处理
    showLunarInfoOnHover(year, month, day) {
      if (day > 0) {
        clearTimeout(this.hoverTimer); // 清除已有的定时器
        this.hoverTimer = setTimeout(() => {
          this.hoverLunarInfo = this.getLunarInfo(year, month, day);
          this.hoverDay = day;
          this.showHoverInfo = true;
        }, 200); // 延迟200毫秒显示提示信息
      }
    },
    hideLunarInfoOnHover() {
      clearTimeout(this.hoverTimer); // 清除定时器
      this.showHoverInfo = false;
      this.hoverDay = null;
    },
    
    // 月份切换
    prevMonth() {
      this.currentDate = new Date(this.currentYear, this.currentMonth - 1, 1);
      this.currentYear = this.currentDate.getFullYear();
      this.currentMonth = this.currentDate.getMonth();
      return this.currentDate;
    },
    nextMonth() {
      this.currentDate = new Date(this.currentYear, this.currentMonth + 1, 1);
      this.currentYear = this.currentDate.getFullYear();
      this.currentMonth = this.currentDate.getMonth();
      return this.currentDate;
    }
  },
  created() {
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.years.push(i);
    }
    for (let i = 1; i <= 12; i++) {
      this.months.push(i);
    }
  }
};
</script>

<style scoped>
.calendar {
  max-width: 840px;
  border: 1px solid #f1f2f2;
  border-radius: 5px;
  background-image: linear-gradient(to bottom, rgba(21,190,240,0.2), rgba(255,255,255,1));
  padding: 20px;
  margin: 0 auto;
  text-align: center;
  font-family: 'Inter', system-ui, sans-serif;
}

.calendar-title {
  font-size: 24px;
  margin-bottom: 15px;
  color: #333;
}

.calendar-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

select {
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 16px;
  border: 0px solid #ddd;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  width: 140px;
  height: 40px;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 10px;
  font-weight: 600;
  color: #555;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

.calendar-day {
  aspect-ratio: 1/1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
  padding: 4px;
}

.calendar-day:hover:not(.other-month) {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.solar-date {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 1px;
  z-index: 1;
}

.lunar-date {
  font-size: 11px;
  color: #666;
  z-index: 1;
}

.solar-term {
  font-size: 10px;
  color: #15bef0;
  font-weight: 500;
  z-index: 1;
}

.other-month {
  opacity: 0.3;
  cursor: default;
}

.weekend .solar-date {
  color: #e53e3e; /* 红色 */
}

/* 国家法定假日样式 */
.national-holiday::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background-color: rgba(21, 190, 240, 0.08);
  border: 1px solid rgba(21, 190, 240, 0.2);
  border-radius: 5px;
  z-index: 0;
  transition: all 0.2s ease;
}

.national-holiday:hover::before {
  background-color: rgba(21, 190, 240, 0.15);
  border-color: rgba(21, 190, 240, 0.4);
}

.national-holiday .solar-date {
  color: #15bef0;
}

/* 公司年假样式 */
.company-holiday::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background-color: rgba(255, 192, 0, 0.1);
  border: 1px solid rgba(220, 88, 42, 0.15);
  border-radius: 5px;
  z-index: 0;
  transition: all 0.2s ease;
}

.company-holiday:hover::before {
  background-color: rgba(255, 192, 0, 0.2);
  border-color: rgba(220, 88, 42, 0.3);
}

/* 替换日样式 */
.replace-day::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background-color: rgba(0, 82, 136, 0.05);
  border: 1px dashed rgba(0, 82, 136, 0.2);
  border-radius: 5px;
  z-index: 0;
  transition: all 0.2s ease;
}

.replace-day:hover::before {
  background-color: rgba(0, 82, 136, 0.1);
  border-color: rgba(0, 82, 136, 0.4);
}

/* 今日样式 */
.today::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background-color: white;
  border-radius: 5px;
  border: 2px solid #0990cf;
  z-index: 0;
  transition: all 0.2s ease;
}

.today:hover::before {
  border-color: #15bef0;
  box-shadow: 0 0 0 2px rgba(9, 144, 207, 0.1);
}

.today .solar-date {
  color: #0990cf;
  font-weight: 700;
}

/* 鼠标悬停提示 */
.tooltip {
  position: absolute;
  top: -45px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  width: max-content;
  max-width: 180px;
}

.tooltip-content {
  background-color: rgba(9, 144, 207, 0.9);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.calendar-day:hover .tooltip {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .calendar {
    width: 100%;
    padding: 15px;
  }
  
  .calendar-days {
    gap: 2px;
  }
  
  .calendar-day {
    padding: 3px;
    border-radius: 4px;
  }
  
  .solar-date {
    font-size: 14px;
  }
  
  .lunar-date, .solar-term {
    font-size: 9px;
  }
  
  .tooltip {
    top: -35px;
  }
  
  .tooltip-content {
    padding: 3px 6px;
    font-size: 10px;
  }
  
  /* 小屏幕上适当缩小背景尺寸 */
  .national-holiday::before,
  .company-holiday::before,
  .replace-day::before,
  .today::before {
    width: 90%;
    height: 90%;
  }
}
</style>