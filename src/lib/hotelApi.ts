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

export async function getPublicAvailability(checkIn: string, checkOut: string, guests: number) {
  const db = requireSupabase();
  const { data, error } = await db.rpc('get_available_room_types', {
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_guests: guests,
  });
  if (error) throw error;
  return data ?? [];
}

export async function getAdminData() {
  const db = requireSupabase() as any;
  const [reservations, rooms, guests, payments, settings] = await Promise.all([
    db.from('reservations').select('id,confirmation_code,check_in,check_out,guests,status,source,nightly_rate,subtotal,tax,total,notes,created_at,guest:guests(full_name,phone,email),room:rooms(id,room_number,room_type:room_types(name,slug))').order('created_at', { ascending: false }),
    db.from('rooms').select('id,room_number,floor,status,active,room_type_id,room_type:room_types(name,slug,size_sqft,bed_description)').order('room_number'),
    db.from('guests').select('id,full_name,phone,email,created_at,updated_at').order('created_at', { ascending: false }),
    db.from('payments').select('id,reservation_id,amount,method,status,reference,paid_at,created_at').order('created_at', { ascending: false }),
    db.from('hotel_settings').select('*').limit(1).maybeSingle(),
  ]);
  for (const result of [reservations, rooms, guests, payments, settings]) if (result.error) throw result.error;
  return { reservations: reservations.data ?? [], rooms: rooms.data ?? [], guests: guests.data ?? [], payments: payments.data ?? [], settings: settings.data };
}

export async function updateReservationStatus(id: string, status: string) {
  const db = requireSupabase();
  const { data, error } = await db
    .from('reservations')
    .update({ status } as never)
    .eq('id', id)
    .select('id,status')
    .single();
  if (error) throw error;
  return data;
}

export async function updateRoomStatus(id: string, status: string) {
  const db = requireSupabase();
  const { data, error } = await db
    .from('rooms')
    .update({ status } as never)
    .eq('id', id)
    .select('id,status')
    .single();
  if (error) throw error;
  return data;
}


export async function getPublishedMenuAsset() {
  const db = requireSupabase() as any;
  const { data, error } = await db
    .from('media_assets')
    .select('id,kind,storage_path,public_url,title,version,created_at')
    .eq('kind', 'menu_pdf')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (data?.public_url) return data;
  if (data?.storage_path) {
    const { data: publicData } = db.storage.from('bhola-media').getPublicUrl(data.storage_path);
    return { ...data, public_url: publicData.publicUrl };
  }
  return data;
}

export async function uploadMenuPdf(file: File) {
  const db = requireSupabase() as any;
  if (file.type !== 'application/pdf') throw new Error('Only PDF menu files are allowed.');
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
  const path = `menu/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await db.storage.from('bhola-media').upload(path, file, {
    contentType: 'application/pdf',
    upsert: false,
  });
  if (uploadError) throw uploadError;
  const { data: publicData } = db.storage.from('bhola-media').getPublicUrl(path);
  const { data, error } = await db
    .from('media_assets')
    .insert({
      kind: 'menu_pdf',
      storage_path: path,
      public_url: publicData.publicUrl,
      title: file.name,
      alt_text: 'Hotel Bhola Inn digital menu',
      version: 1,
      published: true,
    })
    .select('id,kind,storage_path,public_url,title,version,created_at')
    .single();
  if (error) throw error;
  await db
    .from('media_assets')
    .update({ published: false })
    .eq('kind', 'menu_pdf')
    .neq('id', data.id);
  return data;
}
