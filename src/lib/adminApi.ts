import {db} from './supabase'
const adminEmail=(username:string)=>username.trim().toLowerCase()+'@sports-admin.local'
export async function signInAdmin(username:string,password:string){
 const {data,error}=await db().auth.signInWithPassword({email:adminEmail(username),password})
 if(error)throw error
 if(data.user?.app_metadata?.role!=='admin'&&data.user?.app_metadata?.role!=='manager'){await db().auth.signOut();throw new Error('This account does not have admin access.')}
 return {user:data.user,session:data.session}
}
export async function signOutAdmin(){const {error}=await db().auth.signOut();if(error)throw error}
export async function loadAdmin(){
 const results=await Promise.all([
  db().from('facility_settings').select('*').limit(1).maybeSingle(),
  db().from('facilities').select('*').order('sort_order'),
  db().from('slot_templates').select('*').order('facility_id').order('day_of_week').order('start_time'),
  db().from('date_overrides').select('*').order('override_date').order('start_time'),
  db().from('bookings').select('*').order('booking_date',{ascending:false}).order('start_time'),
 ])
 for(const r of results)if(r.error)throw r.error
 return {settings:results[0].data,facilities:results[1].data||[],slots:results[2].data||[],overrides:results[3].data||[],bookings:results[4].data||[]}
}
export async function saveSettings(id:string,patch:any){const {data,error}=await db().from('facility_settings').update({...patch,updated_at:new Date().toISOString()}).eq('id',id).select('*').single();if(error)throw error;return data}
export async function upsertFacility(row:any){const {data,error}=await db().from('facilities').upsert(row).select('*').single();if(error)throw error;return data}
export async function deleteFacility(id:string){const {error}=await db().from('facilities').delete().eq('id',id);if(error)throw error}
export async function upsertSlot(row:any){const {data,error}=await db().from('slot_templates').upsert(row).select('*').single();if(error)throw error;return data}
export async function deleteSlot(id:string){const {error}=await db().from('slot_templates').delete().eq('id',id);if(error)throw error}
export async function upsertOverride(row:any){const {data,error}=await db().from('date_overrides').upsert(row).select('*').single();if(error)throw error;return data}
export async function deleteOverride(id:string){const {error}=await db().from('date_overrides').delete().eq('id',id);if(error)throw error}
export async function updateBooking(id:string,patch:any){const {data,error}=await db().from('bookings').update({...patch,updated_at:new Date().toISOString()}).eq('id',id).select('*').single();if(error)throw error;return data}