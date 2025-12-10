'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { Plus, Check, X, User, Calendar, ClipboardList } from 'lucide-react'
import { PageHeader, PageContainer, Button, Input, Select, Badge, StatBox, LoadingSpinner, EmptyState } from '@/components/UI'
import { Modal } from '@/components/PageCards'

type Client = Database['public']['Tables']['clients']['Row']
type Item = Database['public']['Tables']['items']['Row']
type Location = Database['public']['Tables']['locations']['Row']
type Reservation = Database['public']['Tables']['reservations']['Row']

interface ReservationWithDetails extends Reservation {
  clients?: Client
  items?: Item
  locations?: Location
}

export default function ReservationsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([])
  const [showClientForm, setShowClientForm] = useState(false)
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [clientForm, setClientForm] = useState({ name: '', phone: '', email: '', notes: '' })
  const [reservationForm, setReservationForm] = useState({
    client_id: '',
    item_id: '',
    location_id: '',
    quantity: '',
    notes: ''
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [clientsRes, itemsRes, locationsRes, reservationsRes] = await Promise.all([
        supabase.from('clients').select('*').order('name'),
        supabase.from('items').select('*').order('name'),
        supabase.from('locations').select('*').order('name'),
        supabase.from('reservations').select('*, clients(*), items(*), locations(*)').order('created_at', { ascending: false })
      ])
      
      if (clientsRes.data) setClients(clientsRes.data)
      if (itemsRes.data) setItems(itemsRes.data)
      if (locationsRes.data) setLocations(locationsRes.data)
      if (reservationsRes.data) setReservations(reservationsRes.data as ReservationWithDetails[])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await supabase.from('clients').insert({
        name: clientForm.name,
        phone: clientForm.phone || null,
        email: clientForm.email || null,
        notes: clientForm.notes || null
      })
      setClientForm({ name: '', phone: '', email: '', notes: '' })
      setShowClientForm(false)
      loadData()
    } catch (error) {
      console.error('Error creating client:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await supabase.from('reservations').insert({
        client_id: reservationForm.client_id,
        item_id: reservationForm.item_id,
        location_id: reservationForm.location_id,
        quantity: parseInt(reservationForm.quantity),
        notes: reservationForm.notes || null,
        status: 'pending'
      })
      setReservationForm({ client_id: '', item_id: '', location_id: '', quantity: '', notes: '' })
      setShowReservationForm(false)
      loadData()
    } catch (error) {
      console.error('Error creating reservation:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: 'completed' | 'cancelled') => {
    await supabase.from('reservations').update({ status }).eq('id', id)
    loadData()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Pending</Badge>
      case 'completed': return <Badge variant="success">Completed</Badge>
      case 'cancelled': return <Badge variant="danger">Cancelled</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  const pendingCount = reservations.filter(r => r.status === 'pending').length
  const completedCount = reservations.filter(r => r.status === 'completed').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Reservations" 
        subtitle="Manage client reservations"
        action={
          <div className="flex gap-2">
            <Button onClick={() => setShowClientForm(true)} variant="secondary">
              <User size={20} />
              <span className="hidden sm:inline">New Client</span>
            </Button>
            <Button onClick={() => setShowReservationForm(true)} variant="primary">
              <Plus size={20} />
              <span className="hidden sm:inline">New Reservation</span>
            </Button>
          </div>
        }
      />

      <PageContainer>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatBox
            icon={<ClipboardList size={24} />}
            label="Total"
            value={reservations.length}
          />
          <StatBox
            icon={<Calendar size={24} />}
            label="Pending"
            value={pendingCount}
            variant="warning"
          />
          <StatBox
            icon={<Check size={24} />}
            label="Completed"
            value={completedCount}
            variant="success"
          />
          <StatBox
            icon={<User size={24} />}
            label="Clients"
            value={clients.length}
          />
        </div>

        {/* Clients Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <User size={18} className="text-primary" />
              Clients
            </h2>
            <Button onClick={() => setShowClientForm(true)} variant="secondary" size="sm">
              <Plus size={18} />
              Add Client
            </Button>
          </div>

          {clients.length === 0 ? (
            <EmptyState
              icon={User}
              title="No clients yet"
              description="Add your first client to get started."
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {clients.slice(0, 8).map((client) => (
                <div key={client.id} className="bg-card p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <User size={16} className="text-primary" />
                    </div>
                    <span className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{client.name}</span>
                  </div>
                  {client.phone && (
                    <p className="text-xs text-muted-foreground pl-12 truncate">{client.phone}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reservations Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ClipboardList size={18} className="text-primary" />
              Reservations
            </h2>
            <Button onClick={() => setShowReservationForm(true)} variant="primary" size="sm">
              <Plus size={18} />
              New Reservation
            </Button>
          </div>

          {reservations.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No reservations yet"
              description="Create your first reservation."
            />
          ) : (
            <div className="space-y-3">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="bg-card p-4 lg:p-5 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">{reservation.items?.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <User size={14} className="text-primary/70" />
                          {reservation.clients?.name}
                        </span>
                        <span>•</span>
                        <span>{reservation.locations?.name}</span>
                        <span>•</span>
                        <span className="font-medium text-foreground">Qty: {reservation.quantity}</span>
                      </div>
                      {reservation.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic bg-muted/50 px-3 py-2 rounded-lg">{reservation.notes}</p>
                      )}
                    </div>
                    <div className="ml-4">{getStatusBadge(reservation.status)}</div>
                  </div>
                  {reservation.status === 'pending' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                      <Button
                        onClick={() => handleUpdateStatus(reservation.id, 'completed')}
                        variant="success"
                        size="sm"
                        className="flex-1"
                      >
                        <Check size={16} />
                        Complete
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(reservation.id, 'cancelled')}
                        variant="danger"
                        size="sm"
                        className="flex-1"
                      >
                        <X size={16} />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContainer>

      {/* Client Modal */}
      <Modal isOpen={showClientForm} onClose={() => setShowClientForm(false)} title="Add Client">
        <form onSubmit={handleCreateClient} className="space-y-4">
          <Input
            label="Client Name"
            value={clientForm.name}
            onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
            placeholder="Enter client name"
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={clientForm.phone}
            onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
            placeholder="Phone number"
          />
          <Input
            label="Email"
            type="email"
            value={clientForm.email}
            onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
            placeholder="Email address"
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
            <textarea
              value={clientForm.notes}
              onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
              placeholder="Additional notes"
              className="form-input w-full"
              rows={2}
            />
          </div>
          <Button type="submit" variant="primary" fullWidth size="lg" loading={submitting}>
            Save Client
          </Button>
        </form>
      </Modal>

      {/* Reservation Modal */}
      <Modal isOpen={showReservationForm} onClose={() => setShowReservationForm(false)} title="New Reservation">
        <form onSubmit={handleCreateReservation} className="space-y-4">
          <Select
            label="Client"
            value={reservationForm.client_id}
            onChange={(e) => setReservationForm({ ...reservationForm, client_id: e.target.value })}
            required
          >
            <option value="">Select Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </Select>
          <Select
            label="Item"
            value={reservationForm.item_id}
            onChange={(e) => setReservationForm({ ...reservationForm, item_id: e.target.value })}
            required
          >
            <option value="">Select Item</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </Select>
          <Select
            label="Location"
            value={reservationForm.location_id}
            onChange={(e) => setReservationForm({ ...reservationForm, location_id: e.target.value })}
            required
          >
            <option value="">Select Location</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </Select>
          <Input
            label="Quantity"
            type="number"
            value={reservationForm.quantity}
            onChange={(e) => setReservationForm({ ...reservationForm, quantity: e.target.value })}
            placeholder="Enter quantity"
            required
            min="1"
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
            <textarea
              value={reservationForm.notes}
              onChange={(e) => setReservationForm({ ...reservationForm, notes: e.target.value })}
              placeholder="Additional notes"
              className="form-input w-full"
              rows={2}
            />
          </div>
          <Button type="submit" variant="primary" fullWidth size="lg" loading={submitting}>
            Create Reservation
          </Button>
        </form>
      </Modal>
    </div>
  )
}

