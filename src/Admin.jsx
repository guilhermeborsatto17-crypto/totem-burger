import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function TelaLogin({ onLogin }) {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  function entrar() {
    if (senha === 'admin123') {
      onLogin()
    } else {
      setErro('Senha incorreta!')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#1a1a1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: 40,
        width: '100%', maxWidth: 380, textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🍔</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Painel Admin</h2>
        <p style={{ color: '#888', marginBottom: 24 }}>Burger House</p>
        <input
          type="password"
          placeholder="Digite a senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && entrar()}
          style={{
            width: '100%', padding: '14px 16px', borderRadius: 10,
            border: '2px solid #eee', fontSize: 16, marginBottom: 12,
            outline: 'none'
          }}
        />
        {erro && <p style={{ color: 'red', marginBottom: 12 }}>{erro}</p>}
        <button onClick={entrar} style={{
          width: '100%', background: '#E85D04', color: '#fff',
          padding: '14px', borderRadius: 10, fontSize: 16, fontWeight: 700
        }}>
          Entrar
        </button>
        <p style={{ color: '#bbb', fontSize: 12, marginTop: 16 }}>
          Senha padrão: admin123
        </p>
      </div>
    </div>
  )
}

function FormProduto({ produto, categorias, onSalvar, onCancelar }) {
  const [form, setForm] = useState(produto || {
    nome: '', descricao: '', preco: '', categoria_id: '', disponivel: true, imagem_url: ''
  })
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(produto?.imagem_url || null)

  function atualizar(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }))
  }

  async function uploadImagem(e) {
    const arquivo = e.target.files[0]
    if (!arquivo) return

    setUploading(true)

    // Cria nome único para o arquivo
    const ext = arquivo.name.split('.').pop()
    const nomeArquivo = `${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('produtos')
      .upload(nomeArquivo, arquivo)

    if (error) {
      alert('Erro ao fazer upload da imagem!')
      setUploading(false)
      return
    }

    // Pega a URL pública da imagem
    const { data } = supabase.storage
      .from('produtos')
      .getPublicUrl(nomeArquivo)

    setPreview(data.publicUrl)
    atualizar('imagem_url', data.publicUrl)
    setUploading(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 24, overflowY: 'auto'
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: 32,
        width: '100%', maxWidth: 480
      }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
          {produto ? 'Editar Produto' : 'Novo Produto'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Upload de imagem */}
          <div>
            <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 6 }}>
              Foto do produto
            </label>
            <div style={{
              border: '2px dashed #eee', borderRadius: 12,
              padding: 16, textAlign: 'center', cursor: 'pointer',
              background: '#fafafa'
            }}
              onClick={() => document.getElementById('input-imagem').click()}
            >
              {preview ? (
                <img src={preview} alt="preview" style={{
                  width: '100%', height: 160, objectFit: 'cover',
                  borderRadius: 8
                }} />
              ) : (
                <div>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
                  <div style={{ fontSize: 14, color: '#888' }}>
                    {uploading ? 'Enviando...' : 'Toque para adicionar foto'}
                  </div>
                </div>
              )}
            </div>
            <input
              id="input-imagem"
              type="file"
              accept="image/*"
              onChange={uploadImagem}
              style={{ display: 'none' }}
            />
            {preview && (
              <button
                onClick={() => { setPreview(null); atualizar('imagem_url', '') }}
                style={{
                  marginTop: 8, fontSize: 12, color: '#e33',
                  background: 'none', border: 'none', cursor: 'pointer'
                }}
              >
                Remover foto
              </button>
            )}
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 6 }}>
              Nome do produto
            </label>
            <input
              value={form.nome}
              onChange={e => atualizar('nome', e.target.value)}
              placeholder="Ex: Smash Clássico"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '2px solid #eee', fontSize: 15, outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 6 }}>
              Descrição
            </label>
            <input
              value={form.descricao}
              onChange={e => atualizar('descricao', e.target.value)}
              placeholder="Ex: Blend 180g, cheddar, alface"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '2px solid #eee', fontSize: 15, outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 6 }}>
              Preço (R$)
            </label>
            <input
              type="number"
              value={form.preco}
              onChange={e => atualizar('preco', e.target.value)}
              placeholder="Ex: 28.90"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '2px solid #eee', fontSize: 15, outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 6 }}>
              Categoria
            </label>
            <select
              value={form.categoria_id}
              onChange={e => atualizar('categoria_id', e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '2px solid #eee', fontSize: 15, outline: 'none',
                background: '#fff'
              }}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icone} {cat.nome}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="checkbox"
              id="disponivel"
              checked={form.disponivel}
              onChange={e => atualizar('disponivel', e.target.checked)}
              style={{ width: 20, height: 20 }}
            />
            <label htmlFor="disponivel" style={{ fontSize: 15, color: '#333' }}>
              Produto disponível no cardápio
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button onClick={onCancelar} style={{
            flex: 1, padding: 14, borderRadius: 10,
            border: '2px solid #eee', fontSize: 15, background: '#fff', color: '#333'
          }}>
            Cancelar
          </button>
          <button onClick={() => onSalvar(form)} style={{
            flex: 2, padding: 14, borderRadius: 10,
            background: uploading ? '#ccc' : '#E85D04',
            color: '#fff', fontSize: 15, fontWeight: 700
          }}
            disabled={uploading}
          >
            {uploading ? 'Aguarde...' : 'Salvar Produto'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const [logado, setLogado] = useState(false)
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [formAberto, setFormAberto] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState(null)
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    if (logado) carregarDados()
  }, [logado])

  async function carregarDados() {
    setCarregando(true)
    const { data: cats } = await supabase
      .from('categorias').select('*').order('ordem')
    const { data: prods } = await supabase
      .from('produtos').select('*, categorias(nome, icone)').order('ordem')
    setCategorias(cats || [])
    setProdutos(prods || [])
    setCarregando(false)
  }

  async function salvarProduto(form) {
    if (!form.nome || !form.preco || !form.categoria_id) {
      alert('Preencha nome, preço e categoria!')
      return
    }
    const dados = {
      nome: form.nome,
      descricao: form.descricao,
      preco: parseFloat(form.preco),
      categoria_id: form.categoria_id,
      disponivel: form.disponivel,
      imagem_url: form.imagem_url || null
    }
    if (form.id) {
      await supabase.from('produtos').update(dados).eq('id', form.id)
      mostrarMensagem('✅ Produto atualizado!')
    } else {
      await supabase.from('produtos').insert(dados)
      mostrarMensagem('✅ Produto criado!')
    }
    setFormAberto(false)
    setProdutoEditando(null)
    carregarDados()
  }

  async function toggleDisponivel(produto) {
    await supabase.from('produtos').update({ disponivel: !produto.disponivel }).eq('id', produto.id)
    mostrarMensagem(produto.disponivel ? '⛔ Produto pausado' : '✅ Produto ativado')
    carregarDados()
  }

  async function excluirProduto(id) {
    if (!confirm('Tem certeza que quer excluir este produto?')) return
    await supabase.from('produtos').delete().eq('id', id)
    mostrarMensagem('🗑️ Produto excluído')
    carregarDados()
  }

  function mostrarMensagem(msg) {
    setMensagem(msg)
    setTimeout(() => setMensagem(''), 3000)
  }

  const produtosFiltrados = categoriaFiltro === 'todas'
    ? produtos
    : produtos.filter(p => p.categoria_id === categoriaFiltro)

  if (!logado) return <TelaLogin onLogin={() => setLogado(true)} />

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{
        background: '#E85D04', padding: '16px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>🍔 Painel Admin</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Burger House</p>
        </div>
        <button onClick={() => { setProdutoEditando(null); setFormAberto(true) }} style={{
          background: '#fff', color: '#E85D04',
          padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 15
        }}>
          + Novo Produto
        </button>
      </div>

      {mensagem && (
        <div style={{
          background: '#1a9c5b', color: '#fff',
          padding: '12px 24px', fontSize: 15, textAlign: 'center'
        }}>
          {mensagem}
        </div>
      )}

      <div style={{
        padding: '16px 24px', display: 'flex', gap: 10,
        overflowX: 'auto', background: '#fff', borderBottom: '1px solid #eee'
      }}>
        <button onClick={() => setCategoriaFiltro('todas')} style={{
          padding: '8px 16px', borderRadius: 20, fontSize: 14, fontWeight: 600,
          background: categoriaFiltro === 'todas' ? '#E85D04' : '#f5f5f5',
          color: categoriaFiltro === 'todas' ? '#fff' : '#333', border: 'none'
        }}>Todas</button>
        {categorias.map(cat => (
          <button key={cat.id} onClick={() => setCategoriaFiltro(cat.id)} style={{
            padding: '8px 16px', borderRadius: 20, fontSize: 14, fontWeight: 600,
            whiteSpace: 'nowrap',
            background: categoriaFiltro === cat.id ? '#E85D04' : '#f5f5f5',
            color: categoriaFiltro === cat.id ? '#fff' : '#333', border: 'none'
          }}>{cat.icone} {cat.nome}</button>
        ))}
      </div>

      <div style={{ padding: 24 }}>
        {carregando ? (
          <p style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>Carregando...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {produtosFiltrados.map(prod => (
              <div key={prod.id} style={{
                background: '#fff', borderRadius: 16, padding: 16,
                display: 'flex', gap: 14, alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                opacity: prod.disponivel ? 1 : 0.5
              }}>
                {/* Imagem do produto */}
                <div style={{
                  width: 70, height: 70, borderRadius: 10,
                  background: '#f5f5f5', flexShrink: 0,
                  overflow: 'hidden', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  {prod.imagem_url ? (
                    <img src={prod.imagem_url} alt={prod.nome} style={{
                      width: '100%', height: '100%', objectFit: 'cover'
                    }} />
                  ) : (
                    <span style={{ fontSize: 30 }}>🍔</span>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{prod.nome}</span>
                    {!prod.disponivel && (
                      <span style={{
                        background: '#fee', color: '#e33',
                        fontSize: 11, padding: '2px 8px', borderRadius: 20
                      }}>PAUSADO</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    {prod.categorias?.icone} {prod.categorias?.nome}
                    {prod.descricao && ` • ${prod.descricao}`}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#E85D04', marginTop: 4 }}>
                    R$ {parseFloat(prod.preco).toFixed(2)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => toggleDisponivel(prod)} style={{
                    padding: '8px 12px', borderRadius: 8, fontSize: 18,
                    background: prod.disponivel ? '#f0fff4' : '#fff0f0',
                    border: '1px solid #eee'
                  }}>{prod.disponivel ? '✅' : '⛔'}</button>
                  <button onClick={() => { setProdutoEditando(prod); setFormAberto(true) }} style={{
                    padding: '8px 12px', borderRadius: 8, fontSize: 18,
                    background: '#f0f4ff', border: '1px solid #eee'
                  }}>✏️</button>
                  <button onClick={() => excluirProduto(prod.id)} style={{
                    padding: '8px 12px', borderRadius: 8, fontSize: 18,
                    background: '#fff0f0', border: '1px solid #eee'
                  }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formAberto && (
        <FormProduto
          produto={produtoEditando}
          categorias={categorias}
          onSalvar={salvarProduto}
          onCancelar={() => { setFormAberto(false); setProdutoEditando(null) }}
        />
      )}
    </div>
  )
}