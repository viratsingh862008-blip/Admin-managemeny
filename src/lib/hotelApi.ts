import { requireSupabase } from './supabase';

export type WebsiteBookingInput = {
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
};

export async function getRoomTypes() {
  const db = requireSupabase();
  const { data, error } = await db
    .from('room_types')
    .select('id,name,slug,description,max_guests,size_sqft,base_price,bed_description')
    .eq('active', true)
    .order('base_price');
  if (error) throw error;
  return data ?? [];
}

export async function getAvailableRooms(checkIn: string, checkOut: string, roomTypeId?: string) {
  const db = requireSupabase();
  let query = db
    .from('rooms')
    .select('id,room_number,room_type_id,status,room_types!inner(name,slug,base_price,max_guests,size_sqft,bed_description)')
    .eq('active', true)
    .not('status', 'in', '(out_of_order,maintenance)');

  if (roomTypeId) query = query.eq('room_type_id', roomTypeId);

  const { data: rooms, error } = await query.order('room_number');
  if (error) throw error;

  const roomIds = (rooms ?? []).map((room) => room.id);
  if (!roomIds.length) return [];

  const [{ data: bookings, error: bookingError }, { data: blocks, error: blockError }] = await Promise.all([
    db.from('reservations')
      .select('room_id,check_in,check_out,status')
      .in('room_id', roomIds)
      .in('status', ['pending', 'confirmed', 'checked_in', 'in_house'])
      .lt('check_in', checkOut)
      .gt('check_out', checkIn),
    db.from('room_blocks')
      .select('room_id,start_date,end_date')
      .in('room_id', roomIds)
      .lt('start_date', checkOut)
      .gt('end_date', checkIn),
  ]);

  if (bookingError) throw bookingError;
  if (blockError) throw blockError;

  const blockedIds = new Set([
    ...(bookings ?? []).map((row) => row.room_id),
    ...(blocks ?? []).map((row) => row.room_id),
  ]);

  return (rooms ?? []).filter((room) => !blockedIds.has(room.id));
}

export async function createWebsiteReservation(input: WebsiteBookingInput) {
  const db = requireSupabase();
  const { data, error } = await db.rpc('create_website_reservation', {
    p_room_type_id: input.roomTypeId,
    p_check_in: input.checkIn,
    p_check_out: input.checkOut,
    p_guests: input.guests,
    p_full_name: input.fullName,
    p_phone: input.phone,
    p_email: input.email ?? null,
    p_notes: input.notes ?? null,
  });

  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function signInAdmin(email: string, password: string) {
  const db = requireSupabase();
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const { data: staff, error: staffError } = await db
    .from('staff_profiles')
    .select('user_id,display_name,role,active')
    .eq('user_id', data.user.id)
    .eq('active', true)
    .maybeSingle();

  if (staffError) throw staffError;
  if (!staff) {
    await db.auth.signOut();
    throw new Error('This account is not authorized for Hotel Bhola Inn admin access.');
  }

  return { user: data.user, staff };
}

export async function signOutAdmin() {
  const db = requireSupabase();
  const { error } = await db.auth.signOut();
  if (error) throw error;
}