import { useState, useEffect } from 'react'
import Admin from './Admin'
import Cozinha from './Cozinha'
import { supabase } from './supabase'

function getSlug() {
  const partes = window.location.pathname.split('/').filter(Boolean)
  if (partes.length === 0) return null
  if (partes[0] === 'admin' || partes[0] === 'cozinha') return null
  return partes[0]
}

function getRotaEspecial() {
  const partes = window.location.pathname.split('/').filter(Boolean)
  const ultima = partes[partes.length - 1]
  if (ultima === 'admin') return 'admin'
  if (ultima === 'cozinha') return 'cozinha'
  return null
}

function TelaInicio({ onComecar, onAdmin, loja }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: loja?.cor_primaria || '#E85D04',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 32
    }}>
      {loja?.logo_url ? (
        <img src={loja.logo_url} alt={loja.nome} style={{
          width: 120, height: 120, borderRadius: 24, objectFit: 'cover'
        }} />
      ) : (
        <div style={{ fontSize: 80 }}>🍔</div>
      )}
      <h1 style={{ color: '#fff', fontSize: 42, fontWeight: 700 }}>
        {loja?.nome || 'Burger House'}
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 20 }}>
        Toque para começar
      </p>
      <button onClick={onComecar} style={{
        background: '#fff',
        color: loja?.cor_primaria || '#E85D04',
        fontSize: 24, fontWeight: 700,
        padding: '20px 60px', borderRadius: 16, marginTop: 16,
        border: 'none', cursor: 'pointer'
      }}>Fazer Pedido</button>
      <button onClick={onAdmin} style={{
        background: 'transparent', color: 'rgba(255,255,255,0.2)',
        fontSize: 11, marginTop: 40, padding: '8px 16px',
        border: 'none', cursor: 'pointer'
      }}>⚙</button>
    </div>
  )
}

function TelaCategorias({ onEscolher, carrinho, onVerCarrinho, loja }) {
  const [categorias, setCategorias] = useState([])
  const total = carrinho.reduce((s, i) => s + i.preco * i.qty, 0)
  const cor = loja?.cor_primaria || '#E85D04'

  useEffect(() => {
    let query = supabase.from('categorias').select('*').eq('ativo', true).order('ordem')
    if (loja?.id) query = query.eq('loja_id', loja.id)
    query.then(({ data }) => setCategorias(data || []))
  }, [loja])

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{
        background: cor, padding: '20px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <h2 style={{ color: '#fff', fontSize: 22 }}>O que você quer?</h2>
        {carrinho.length > 0 && (
          <button onClick={onVerCarrinho} style={{
            background: '#fff', color: cor,
            padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 15,
            border: 'none', cursor: 'pointer'
          }}>🛒 R$ {total.toFixed(2)}</button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 24 }}>
        {categorias.map(cat => (
          <button key={cat.id} onClick={() => onEscolher(cat)} style={{
            background: '#fff', borderRadius: 16, padding: '32px 16px',
            fontSize: 16, fontWeight: 600, color: '#333',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: 'none', cursor: 'pointer'
          }}>
            <span style={{ fontSize: 48 }}>{cat.icone}</span>
            {cat.nome}
          </button>
        ))}
      </div>
    </div>
  )
}

function TelaProdutos({ categoria, onVoltar, onAdicionar, carrinho, onVerCarrinho, loja }) {
  const [produtos, setProdutos] = useState([])
  const total = carrinho.reduce((s, i) => s + i.preco * i.qty, 0)
  const cor = loja?.cor_primaria || '#E85D04'

  useEffect(() => {
    let query = supabase.from('produtos').select('*')
      .eq('categoria_id', categoria.id)
      .eq('disponivel', true)
      .order('ordem')
    if (loja?.id) query = query.eq('loja_id', loja.id)
    query.then(({ data }) => setProdutos(data || []))
  }, [categoria.id, loja])

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{
        background: cor, padding: '20px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onVoltar} style={{
            background: 'rgba(255,255,255,0.2)', color: '#fff',
            padding: '8px 14px', borderRadius: 8, fontSize: 18,
            border: 'none', cursor: 'pointer'
          }}>←</button>
          <h2 style={{ color: '#fff', fontSize: 22 }}>{categoria.icone} {categoria.nome}</h2>
        </div>
        {carrinho.length > 0 && (
          <button onClick={onVerCarrinho} style={{
            background: '#fff', color: cor,
            padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 15,
            border: 'none', cursor: 'pointer'
          }}>🛒 R$ {total.toFixed(2)}</button>
        )}
      </div>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {produtos.length === 0 && (
          <p style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>
            Nenhum produto disponível
          </p>
        )}
        {produtos.map(prod => (
          <div key={prod.id} style={{
            background: '#fff', borderRadius: 16,
            display: 'flex', alignItems: 'center',
            overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              width: 110, height: 110, flexShrink: 0,
              background: '#f5f5f5',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {prod.imagem_url ? (
                <img src={prod.imagem_url} alt={prod.nome}
                  style={{ width: 110, height: 110, objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 40 }}>🍔</span>
              )}
            </div>
            <div style={{ flex: 1, padding: '12px 14px' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#222' }}>{prod.nome}</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 3, lineHeight: 1.4 }}>
                {prod.descricao}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: cor, marginTop: 6 }}>
                R$ {prod.preco.toFixed(2)}
              </div>
            </div>
            <button onClick={() => onAdicionar(prod)} style={{
              background: cor, color: '#fff',
              width: 48, height: 48, borderRadius: 10,
              fontSize: 26, fontWeight: 700, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', margin: 14
            }}>+</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function TelaCarrinho({ carrinho, onVoltar, onAvancar, onRemover, loja }) {
  const total = carrinho.reduce((s, i) => s + i.preco * i.qty, 0)
  const cor = loja?.cor_primaria || '#E85D04'

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{
        background: cor, padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <button onClick={onVoltar} style={{
          background: 'rgba(255,255,255,0.2)', color: '#fff',
          padding: '8px 14px', borderRadius: 8, fontSize: 18,
          border: 'none', cursor: 'pointer'
        }}>←</button>
        <h2 style={{ color: '#fff', fontSize: 22 }}>Meu Pedido</h2>
      </div>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {carrinho.length === 0 && (
          <p style={{ textAlign: 'center', color: '#888', marginTop: 60, fontSize: 18 }}>
            Carrinho vazio
          </p>
        )}
        {carrinho.map((item, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 16, padding: 16,
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 10, flexShrink: 0,
              background: '#f5f5f5', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {item.imagem_url ? (
                <img src={item.imagem_url} alt={item.nome}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 26 }}>🍔</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{item.nome}</div>
              <div style={{ fontSize: 14, color: cor, marginTop: 2 }}>
                R$ {(item.preco * item.qty).toFixed(2)}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>x{item.qty}</span>
              <button onClick={() => onRemover(i)} style={{
                background: '#fee', color: '#e33',
                width: 34, height: 34, borderRadius: 8, fontSize: 18,
                border: 'none', cursor: 'pointer'
              }}>×</button>
            </div>
          </div>
        ))}
      </div>

      {carrinho.length > 0 && (
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 20,
            marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700
          }}>
            <span>Total</span>
            <span style={{ color: cor }}>R$ {total.toFixed(2)}</span>
          </div>
          <button onClick={onAvancar} style={{
            width: '100%', background: cor, color: '#fff',
            padding: 20, borderRadius: 16, fontSize: 20, fontWeight: 700,
            border: 'none', cursor: 'pointer'
          }}>Escolher Pagamento →</button>
        </div>
      )}
    </div>
  )
}

function TelaPagamento({ carrinho, onVoltar, onFinalizar, loja }) {
  const [pagamento, setPagamento] = useState(null)
  const [local, setLocal] = useState(null)
  const total = carrinho.reduce((s, i) => s + i.preco * i.qty, 0)
  const cor = loja?.cor_primaria || '#E85D04'

  const formas = [
    { id: 'cartao_credito', nome: 'Crédito',  icone: '💳' },
    { id: 'cartao_debito',  nome: 'Débito',   icone: '💳' },
    { id: 'pix',            nome: 'PIX',      icone: '📱' },
    { id: 'dinheiro',       nome: 'Dinheiro', icone: '💵' },
  ]

  const locais = [
    { id: 'aqui',   nome: 'Comer Aqui',  icone: '🪑' },
    { id: 'viagem', nome: 'Para Viagem', icone: '🛍️' },
  ]

  const podeFinalizar = pagamento && local

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{
        background: cor, padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <button onClick={onVoltar} style={{
          background: 'rgba(255,255,255,0.2)', color: '#fff',
          padding: '8px 14px', borderRadius: 8, fontSize: 18,
          border: 'none', cursor: 'pointer'
        }}>←</button>
        <h2 style={{ color: '#fff', fontSize: 22 }}>Finalizar Pedido</h2>
      </div>

      <div style={{ padding: 24 }}>
        <div style={{
          background: '#fff', borderRadius: 16, padding: 20, marginBottom: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: 18, color: '#666' }}>Total do pedido</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: cor }}>
            R$ {total.toFixed(2)}
          </span>
        </div>

        <p style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 12 }}>
          Para comer onde?
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {locais.map(l => (
            <button key={l.id} onClick={() => setLocal(l.id)} style={{
              background: local === l.id ? cor : '#fff',
              color: local === l.id ? '#fff' : '#333',
              border: local === l.id ? `2px solid ${cor}` : '2px solid #eee',
              borderRadius: 16, padding: '20px 16px', fontSize: 16, fontWeight: 600,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer'
            }}>
              <span style={{ fontSize: 36 }}>{l.icone}</span>
              {l.nome}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 12 }}>
          Como vai pagar?
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {formas.map(f => (
            <button key={f.id} onClick={() => setPagamento(f.id)} style={{
              background: pagamento === f.id ? cor : '#fff',
              color: pagamento === f.id ? '#fff' : '#333',
              border: pagamento === f.id ? `2px solid ${cor}` : '2px solid #eee',
              borderRadius: 16, padding: '20px 16px', fontSize: 16, fontWeight: 600,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer'
            }}>
              <span style={{ fontSize: 36 }}>{f.icone}</span>
              {f.nome}
            </button>
          ))}
        </div>

        <button
          onClick={() => podeFinalizar && onFinalizar(pagamento, local)}
          style={{
            width: '100%', background: podeFinalizar ? cor : '#ccc',
            color: '#fff', padding: 20, borderRadius: 16, fontSize: 20, fontWeight: 700,
            border: 'none', cursor: podeFinalizar ? 'pointer' : 'not-allowed'
          }}
        >
          {podeFinalizar ? 'Confirmar Pedido ✓' : 'Selecione as opções acima'}
        </button>
      </div>
    </div>
  )
}

function TelaConfirmacao({ numero, onNovoPedido, loja }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#1a9c5b',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 24
    }}>
      <div style={{ fontSize: 80 }}>✅</div>
      <h1 style={{ color: '#fff', fontSize: 36, fontWeight: 700 }}>Pedido Realizado!</h1>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '32px 64px', textAlign: 'center'
      }}>
        <div style={{ fontSize: 18, color: '#666' }}>Sua senha</div>
        <div style={{ fontSize: 80, fontWeight: 700, color: '#1a9c5b' }}>
          #{String(numero).padStart(3, '0')}
        </div>
        <div style={{ fontSize: 16, color: '#888' }}>Aguarde ser chamado</div>
      </div>
      <button onClick={onNovoPedido} style={{
        background: '#fff', color: '#1a9c5b',
        padding: '18px 48px', borderRadius: 16, fontSize: 20, fontWeight: 700,
        border: 'none', cursor: 'pointer'
      }}>Novo Pedido</button>
    </div>
  )
}

export default function App() {
  const [tela, setTela] = useState('inicio')
  const [categoriaAtual, setCategoriaAtual] = useState(null)
  const [carrinho, setCarrinho] = useState([])
  const [numeroPedido, setNumeroPedido] = useState(null)
  const [loja, setLoja] = useState(null)

  const rotaEspecial = getRotaEspecial()
  const slug = getSlug()

  useEffect(() => {
    async function carregarLoja() {
      if (slug) {
        const { data } = await supabase
          .from('lojas').select('*').eq('slug', slug).single()
        setLoja(data)
      } else {
        const { data } = await supabase
          .from('lojas').select('*').eq('ativo', true).limit(1).single()
        setLoja(data)
      }
    }
    carregarLoja()
  }, [])

  function adicionarAoCarrinho(produto) {
    setCarrinho(prev => {
      const existe = prev.find(i => i.id === produto.id)
      if (existe) {
        return prev.map(i => i.id === produto.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...produto, qty: 1 }]
    })
  }

  function removerDoCarrinho(index) {
    setCarrinho(prev => prev.filter((_, i) => i !== index))
  }

  async function finalizarPedido(pagamento, local) {
    const total = carrinho.reduce((s, i) => s + i.preco * i.qty, 0)

    const hoje = new Date().toISOString().split('T')[0]
    const { data: pedidosHoje } = await supabase
      .from('pedidos').select('numero')
      .eq('loja_id', loja.id)
      .gte('criado_em', hoje)
      .order('numero', { ascending: false })
      .limit(1)

    const proximoNumero = pedidosHoje && pedidosHoje.length > 0
      ? pedidosHoje[0].numero + 1 : 1

    const { data: pedido } = await supabase
      .from('pedidos')
      .insert({
        numero: proximoNumero,
        status: 'pendente',
        forma_pagamento: pagamento,
        local: local,
        total: total,
        loja_id: loja.id
      })
      .select()
      .single()

    await supabase.from('itens_pedido').insert(
      carrinho.map(i => ({
        pedido_id: pedido.id,
        produto_id: i.id,
        nome: i.nome,
        preco: i.preco,
        quantidade: i.qty
      }))
    )

    setNumeroPedido(pedido.numero)
    setCarrinho([])
    setTela('confirmacao')
  }

  if (rotaEspecial === 'admin') return <Admin />
  if (rotaEspecial === 'cozinha') return <Cozinha slug={slug} />

  if (tela === 'inicio') return (
    <TelaInicio
      onComecar={() => setTela('categorias')}
      onAdmin={() => window.location.href = `/${slug}/admin`}
      loja={loja}
    />
  )
  if (tela === 'categorias') return (
    <TelaCategorias
      onEscolher={cat => { setCategoriaAtual(cat); setTela('produtos') }}
      carrinho={carrinho}
      onVerCarrinho={() => setTela('carrinho')}
      loja={loja}
    />
  )
  if (tela === 'produtos') return (
    <TelaProdutos
      categoria={categoriaAtual}
      onVoltar={() => setTela('categorias')}
      onAdicionar={adicionarAoCarrinho}
      carrinho={carrinho}
      onVerCarrinho={() => setTela('carrinho')}
      loja={loja}
    />
  )
  if (tela === 'carrinho') return (
    <TelaCarrinho
      carrinho={carrinho}
      onVoltar={() => setTela('categorias')}
      onAvancar={() => setTela('pagamento')}
      onRemover={removerDoCarrinho}
      loja={loja}
    />
  )
  if (tela === 'pagamento') return (
    <TelaPagamento
      carrinho={carrinho}
      onVoltar={() => setTela('carrinho')}
      onFinalizar={finalizarPedido}
      loja={loja}
    />
  )
  if (tela === 'confirmacao') return (
    <TelaConfirmacao
      numero={numeroPedido}
      onNovoPedido={() => setTela('inicio')}
      loja={loja}
    />
  )
}