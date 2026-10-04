export function formatTime(value:string){
 const parts=value.slice(0,5).split(':').map(Number)
 const h=parts[0]; const m=parts[1]; const suffix=h>=12?'PM':'AM'; const hour=h%12||12
 return String(hour)+':'+String(m).padStart(2,'0')+' '+suffix
}
export function money(value:number){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value)}
export function todayISO(){return new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'})}
export function localDateLabel(value:string){return new Date(value+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}