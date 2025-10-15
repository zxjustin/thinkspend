<template>
  <div class="h-full flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <div>
        <h3 class="font-semibold text-gray-800">Knowledge Graph</h3>
        <p class="text-xs text-gray-500 mt-0.5">Visual network of your notes and connections</p>
      </div>
      <div class="flex gap-2">
        <Button
          icon="pi pi-refresh"
          text
          rounded
          size="small"
          @click="loadGraph"
          v-tooltip.top="'Refresh Graph'"
        />
        <Button
          icon="pi pi-times"
          text
          rounded
          size="small"
          @click="$emit('close')"
        />
      </div>
    </div>

    <!-- Stats -->
    <div class="px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200">
      <div class="flex gap-4 text-sm">
        <span class="flex items-center gap-1">
          <i class="pi pi-circle-fill text-blue-500 text-xs"></i>
          <span class="text-gray-700"><strong>{{ nodeCount }}</strong> Notes</span>
        </span>
        <span class="flex items-center gap-1">
          <i class="pi pi-arrows-h text-purple-500 text-xs"></i>
          <span class="text-gray-700"><strong>{{ linkCount }}</strong> Links</span>
        </span>
      </div>
    </div>

    <!-- Graph Container -->
    <div class="flex-1 relative overflow-hidden bg-gradient-to-br from-purple-50/30 to-blue-50/30">
      <svg
        ref="svgRef"
        class="w-full h-full"
      />

      <!-- Legend -->
      <div class="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg p-3 text-xs shadow-lg border border-gray-200">
        <div class="font-semibold text-gray-800 mb-2">Legend</div>
        <div class="space-y-1.5">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
            <span class="text-gray-600">Regular Note</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span class="text-gray-600">Current Note</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-8 h-0.5 bg-purple-400"></div>
            <span class="text-gray-600">Bidirectional Link</span>
          </div>
        </div>
        <div class="mt-2 pt-2 border-t border-gray-200 text-[10px] text-gray-500">
          <p>💡 Click nodes to navigate</p>
          <p>🖱️ Drag nodes to rearrange</p>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="nodeCount === 0"
        class="absolute inset-0 flex items-center justify-center"
      >
        <div class="text-center text-gray-400">
          <i class="pi pi-sitemap text-6xl mb-4"></i>
          <p class="text-lg">No notes to visualize yet</p>
          <p class="text-sm mt-2">Create some notes and link them with [[brackets]]</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useNotesStore } from '@/stores/notes'
import Button from 'primevue/button'
import * as d3 from 'd3'

defineEmits(['close'])

const notesStore = useNotesStore()
const svgRef = ref(null)
const nodeCount = ref(0)
const linkCount = ref(0)

const currentNote = computed(() => notesStore.currentNote)

let simulation = null
let nodes = []
let links = []

/**
 * Load graph data from store
 * Fetches all notes and their connections
 */
async function loadGraph() {
  console.log('📊 Loading graph data...')

  const allNotes = notesStore.notes

  if (allNotes.length === 0) {
    nodeCount.value = 0
    linkCount.value = 0
    return
  }

  // Create nodes from notes
  nodes = allNotes.map(note => ({
    id: note.id,
    title: note.title,
    isCurrent: note.id === currentNote.value?.id
  }))

  // Fetch all links between notes
  const linkPromises = allNotes.map(note => notesStore.fetchNoteLinks(note.id))
  const allLinks = await Promise.all(linkPromises)

  // Create links array for D3
  links = []
  allLinks.forEach((noteLinks, noteIndex) => {
    noteLinks.forEach(link => {
      const sourceNode = nodes.find(n => n.id === allNotes[noteIndex].id)
      const targetNode = nodes.find(n => n.id === link.target_note_id)

      if (sourceNode && targetNode) {
        links.push({
          source: sourceNode.id,
          target: targetNode.id,
          linkText: link.link_text
        })
      }
    })
  })

  nodeCount.value = nodes.length
  linkCount.value = links.length

  console.log(`✅ Loaded ${nodes.length} nodes, ${links.length} links`)

  // Render the graph
  renderGraph()
}

/**
 * Render graph using D3's force-directed layout
 * This creates the visual network with physics simulation
 */
function renderGraph() {
  if (!svgRef.value) return

  const svg = d3.select(svgRef.value)
  const width = svgRef.value.clientWidth
  const height = svgRef.value.clientHeight

  // Clear previous graph
  svg.selectAll('*').remove()

  // Create container group (for zoom/pan)
  const g = svg.append('g')

  // Add zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.3, 3])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
    })

  svg.call(zoom)

  // Create force simulation
  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(30))

  // Draw links (edges)
  const link = g.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#a78bfa') // Purple-400
    .attr('stroke-width', 2)
    .attr('stroke-opacity', 0.6)

  // Draw nodes
  const node = g.append('g')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .call(d3.drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded))
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      // Navigate to clicked note
      notesStore.selectNote(d.id)
      console.log('📍 Selected note from graph:', d.title)
    })

  // Add circles to nodes
  node.append('circle')
    .attr('r', 10)
    .attr('fill', d => d.isCurrent ? '#22c55e' : '#3b82f6') // Green if current, blue otherwise
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)

  // Add labels to nodes
  node.append('text')
    .text(d => d.title.length > 20 ? d.title.slice(0, 20) + '...' : d.title)
    .attr('x', 15)
    .attr('y', 5)
    .attr('font-size', '12px')
    .attr('fill', '#374151') // Gray-700
    .attr('font-weight', d => d.isCurrent ? 'bold' : 'normal')

  // Add hover effect
  node.on('mouseenter', function(event, d) {
    d3.select(this).select('circle')
      .transition()
      .duration(200)
      .attr('r', 15)
      .attr('fill', '#f59e0b') // Amber-500 on hover
  })

  node.on('mouseleave', function(event, d) {
    d3.select(this).select('circle')
      .transition()
      .duration(200)
      .attr('r', 10)
      .attr('fill', d.isCurrent ? '#22c55e' : '#3b82f6')
  })

  // Update positions on each simulation tick
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    node.attr('transform', d => `translate(${d.x},${d.y})`)
  })

  // Drag functions
  function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }

  function dragged(event, d) {
    d.fx = event.x
    d.fy = event.y
  }

  function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
  }
}

// Lifecycle
onMounted(() => {
  loadGraph()
})

onBeforeUnmount(() => {
  if (simulation) {
    simulation.stop()
  }
})

// Update current note highlighting when selection changes
watch(currentNote, () => {
  if (!svgRef.value) return

  nodes.forEach(node => {
    node.isCurrent = node.id === currentNote.value?.id
  })

  // Update circle colors
  d3.select(svgRef.value)
    .selectAll('circle')
    .attr('fill', d => d.isCurrent ? '#22c55e' : '#3b82f6')

  // Update label weights
  d3.select(svgRef.value)
    .selectAll('text')
    .attr('font-weight', d => d.isCurrent ? 'bold' : 'normal')
})
</script>
