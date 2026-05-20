import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const STATUS_COR = {
  pendente:   { bg: '#fff8e1', borda: '#f59e0b', label: '🟡 Novo'       },
  preparando: { bg: '#eff6ff', borda: '#3b82f6', label: '🔵 Preparando' },
  pronto:     { bg: '#f0fdf4', borda: '#22c55e', label: '🟢 Pronto'     },
}

export default function Cozinha() {
  const [pedidos, setPedidos] = useState([])

  useEffect(() => {
    carregarPedidos()

    const canal = supabase
      .channel('cozinha')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'pedidos'
      }, () => carregarPedidos())
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'itens_pedido'
      }, () => carregarPedidos())
      .subscribe()

    return () => supabase.removeChannel(canal)
  }, [])

  async function carregarPedidos() {
    const { data } = await supabase
      .from('pedidos')
      .select('*, itens_pedido(*)')
      .in('status', ['pendente', 'preparando'])
      .order('criado_em', { ascending: true })
    setPedidos(data || [])
  }

  async function atualizarStatus(id, status) {
    await supabase.from('pedidos').update({ status }).eq('id', id)
  }

  function tempoDecorrido(data) {
    const diff = Math.floor((new Date() - new Date(data)) / 1000 / 60)
    if (diff < 1) return 'agora'
    return `${diff} min atrás`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111', padding: 20 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 24
      }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>🍳 Cozinha</h1>
          <p style={{ color: '#888', fontSize: 14 }}>{pedidos.length} pedido(s) em aberto</p>
        </div>
        <button onClick={carregarPedidos} style={{
          background: '#333', color: '#fff',
          padding: '10px 20px', borderRadius: 10,
          fontSize: 14, border: 'none', cursor: 'pointer'
        }}>🔄 Atualizar</button>
      </div>

      {pedidos.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <div style={{ fontSize: 64 }}>✅</div>
          <p style={{ color: '#888', fontSize: 20, marginTop: 16 }}>
            Nenhum pedido em aberto
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16
        }}>
          {pedidos.map(pedido => {
            const cor = STATUS_COR[pedido.status] || STATUS_COR.pendente
            return (
              <div key={pedido.id} style={{
                background: cor.bg, border: `2px solid ${cor.borda}`,
                borderRadius: 16, padding: 20
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 16
                }}>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#111' }}>
                      #{String(pedido.numero).padStart(3, '0')}
                    </div>
                    <div style={{ fontSize: 12, color: '#888' }}>
                      {tempoDecorrido(pedido.criado_em)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      background: cor.borda, color: '#fff',
                      padding: '4px 10px', borderRadius: 20,
                      fontSize: 12, fontWeight: 600, marginBottom: 4
                    }}>{cor.label}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {pedido.local === 'aqui' ? '🪑 Comer aqui' : '🛍️ Viagem'}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.6)',
                  borderRadius: 10, padding: 12, marginBottom: 16
                }}>
                  {pedido.itens_pedido?.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '6px 0',
                      borderBottom: i < pedido.itens_pedido.length - 1
                        ? '1px solid rgba(0,0,0,0.08)' : 'none'
                    }}>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>
                        {item.quantidade}x {item.nome}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {pedido.status === 'pendente' && (
                    <button onClick={() => atualizarStatus(pedido.id, 'preparando')} style={{
                      flex: 1, padding: 12, background: '#3b82f6', color: '#fff',
                      borderRadius: 10, fontWeight: 700, fontSize: 14,
                      border: 'none', cursor: 'pointer'
                    }}>👨‍🍳 Iniciar</button>
                  )}
                  {pedido.status === 'preparando' && (
                    <button onClick={() => atualizarStatus(pedido.id, 'pronto')} style={{
                      flex: 1, padding: 12, background: '#22c55e', color: '#fff',
                      borderRadius: 10, fontWeight: 700, fontSize: 14,
                      border: 'none', cursor: 'pointer'
                    }}>✅ Pronto!</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}