'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { Plus, MapPin } from 'lucide-react'
import { PageHeader, PageContainer, Button, Input, EmptyState, LoadingSpinner } from '@/components/UI'
import { LocationCard, Modal } from '@/components/PageCards'
import { logActivity } from '@/lib/activityLog'

type Location = Database['public']['Tables']['locations']['Row']
type Stock = Database['public']['Tables']['stock']['Row']

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [stock, setStock] = useState<Stock[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  })

  const loadLocations = async () => {
    try {
      const { data } = await supabase.from('locations').select('*').order('name')
      if (data) setLocations(data)
    } catch (error) {
      console.error('Error loading locations:', error)
    }
  }

  const loadStock = async () => {
    try {
      const { data } = await supabase.from('stock').select('*')
      if (data) setStock(data)
    } catch (error) {
      console.error('Error loading stock:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([loadLocations(), loadStock()])
      setLoading(false)
    }
    loadData()
  }, [])

  const getLocationItemCount = (locationId: string) => {
    return stock.filter(s => s.location_id === locationId && s.quantity > 0).length
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const data = {
        name: formData.name,
        address: formData.address || null
      }

      if (editingLocation) {
        await supabase.from('locations').update(data).eq('id', editingLocation.id)
        await logActivity({
          action: 'update',
          entityType: 'location',
          entityId: editingLocation.id,
          entityName: formData.name,
          details: `Updated location: ${formData.name}`
        })
      } else {
        const { data: newLocation } = await supabase.from('locations').insert(data).select().single()
        if (newLocation) {
          await logActivity({
            action: 'create',
            entityType: 'location',
            entityId: newLocation.id,
            entityName: formData.name,
            details: `Created location: ${formData.name}${formData.address ? ` at ${formData.address}` : ''}`
          })
        }
      }

      setFormData({ name: '', address: '' })
      setShowForm(false)
      setEditingLocation(null)
      loadLocations()
    } catch (error) {
      console.error('Error saving location:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (location: Location) => {
    setEditingLocation(location)
    setFormData({
      name: location.name,
      address: location.address || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    const location = locations.find(l => l.id === id)
    if (confirm('Delete this location? This will also delete all associated stock.')) {
      await supabase.from('locations').delete().eq('id', id)
      await logActivity({
        action: 'delete',
        entityType: 'location',
        entityId: id,
        entityName: location?.name,
        details: `Deleted location: ${location?.name}`
      })
      loadLocations()
    }
  }

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
        title="Locations" 
        subtitle="Manage warehouse and store locations"
        action={
          <Button 
            onClick={() => {
              setEditingLocation(null)
              setFormData({ name: '', address: '' })
              setShowForm(true)
            }} 
            variant="primary"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">New Location</span>
          </Button>
        }
      />

      <PageContainer>
        {locations.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No locations yet"
            description="Create your first location to get started!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location) => (
              <LocationCard
                key={location.id}
                name={location.name}
                address={location.address}
                itemCount={getLocationItemCount(location.id)}
                onEdit={() => handleEdit(location)}
                onDelete={() => handleDelete(location.id)}
              />
            ))}
          </div>
        )}
      </PageContainer>

      {/* Location Modal */}
      <Modal 
        isOpen={showForm} 
        onClose={() => {
          setShowForm(false)
          setEditingLocation(null)
        }} 
        title={editingLocation ? 'Edit Location' : 'Create Location'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Location Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter location name"
            required
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Address (Optional)</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter full address"
              className="form-input w-full"
              rows={3}
            />
          </div>
          <Button type="submit" variant="primary" fullWidth size="lg" loading={submitting}>
            {editingLocation ? 'Update Location' : 'Create Location'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}

