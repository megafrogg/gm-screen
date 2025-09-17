'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Dashboard from '@/components/layout/Dashboard'

interface Campaign {
  id: string
  name: string
  game_system: string
  created_at: string
}

export default function CampaignsPage() {
  const { user } = useUser()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCampaigns = useCallback(async () => {
    try {
      console.log('Fetching campaigns for user:', user?.id)
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      
      // First, test basic connection
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (testError) {
        console.error('Supabase connection test failed:', testError)
        throw new Error(`Supabase connection failed: ${testError.message}`)
      }
      
      console.log('Supabase connection test passed')
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
      
      console.log('Campaigns fetched successfully:', data)
      setCampaigns(data || [])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      // Show a more helpful error message
      alert(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check if you've run the database schema.`)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user) {
      fetchCampaigns()
    }
  }, [user, fetchCampaigns])

  const createCampaign = async (name: string, gameSystem: string) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([
          {
            user_id: user.id,
            name,
            game_system: gameSystem,
          },
        ])
        .select()

      if (error) throw error
      if (data) {
        setCampaigns([data[0], ...campaigns])
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
    }
  }

  if (loading) {
    return (
      <Dashboard>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading campaigns...</div>
        </div>
      </Dashboard>
    )
  }

  return (
    <Dashboard>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <CreateCampaignModal onCreateCampaign={createCampaign} />
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No campaigns yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first campaign to get started.
            </p>
            <CreateCampaignModal onCreateCampaign={createCampaign} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </Dashboard>
  )
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {campaign.name}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          System: {campaign.game_system}
        </p>
        <p className="text-xs text-gray-500">
          Created: {new Date(campaign.created_at).toLocaleDateString()}
        </p>
      </div>
    </Link>
  )
}

function CreateCampaignModal({ onCreateCampaign }: { onCreateCampaign: (name: string, gameSystem: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [gameSystem, setGameSystem] = useState('Cairn')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreateCampaign(name.trim(), gameSystem)
      setName('')
      setGameSystem('Cairn')
      setIsOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Create Campaign
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New Campaign
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter campaign name"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="gameSystem" className="block text-sm font-medium text-gray-700 mb-2">
                    Game System
                  </label>
                  <select
                    id="gameSystem"
                    value={gameSystem}
                    onChange={(e) => setGameSystem(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Cairn">Cairn</option>
                    <option value="D&D 5e">D&D 5e</option>
                    <option value="Blades in the Dark">Blades in the Dark</option>
                    <option value="Call of Cthulhu">Call of Cthulhu</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
