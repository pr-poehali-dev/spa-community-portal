import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

export default function BlogEditorPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [isDraft, setIsDraft] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const applyFormat = (format: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = '';
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        newText = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        cursorOffset = 1;
        break;
      case 'heading':
        newText = `## ${selectedText}`;
        cursorOffset = 3;
        break;
      case 'quote':
        newText = `> ${selectedText}`;
        cursorOffset = 2;
        break;
      case 'link':
        newText = `[${selectedText}](URL)`;
        cursorOffset = 1;
        break;
      case 'list':
        newText = `- ${selectedText}`;
        cursorOffset = 2;
        break;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset + selectedText.length);
    }, 0);
  };

  const handleSave = async (publish: boolean = false) => {
    if (!title.trim() || !content.trim()) {
      alert('Заполните название и содержание поста');
      return;
    }

    setSaving(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/api/blog/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          excerpt: excerpt || content.substring(0, 200),
          content,
          tags,
          cover_image: coverImage,
          is_draft: !publish,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        navigate(`/blog/${data.post.id}`);
      } else {
        alert('Ошибка при сохранении поста');
      }
    } catch (error) {
      console.error('Failed to save post:', error);
      alert('Ошибка при сохранении поста');
    } finally {
      setSaving(false);
    }
  };

  const renderPreview = () => {
    let html = content;
    
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-orange-900 mt-6 mb-4">$1</h2>');
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-orange-900 mt-4 mb-3">$1</h3>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-orange-900">$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-orange-400 pl-4 italic text-gray-700 my-4">$1</blockquote>');
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-orange-600 hover:text-orange-700 underline">$1</a>');
    html = html.replace(/^- (.+)$/gm, '<li class="ml-6">$1</li>');
    html = html.replace(/(<li.*<\/li>)/s, '<ul class="list-disc my-4">$1</ul>');
    html = html.replace(/\n\n/g, '</p><p class="mb-4">');
    html = `<p class="mb-4">${html}</p>`;

    return html;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/blog')}
            className="hover:bg-orange-100"
          >
            <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Назад к блогу
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              <Icon name="Save" className="h-4 w-4 mr-2" />
              Сохранить черновик
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
            >
              <Icon name="Send" className="h-4 w-4 mr-2" />
              Опубликовать
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="border-orange-100">
              <CardHeader>
                <CardTitle className="text-orange-900 flex items-center gap-2">
                  <Icon name="Edit" className="h-5 w-5" />
                  Редактор
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Заголовок</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Введите заголовок поста..."
                    className="text-xl font-bold border-orange-200 focus:border-orange-400"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Краткое описание</Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Краткое описание для превью..."
                    rows={2}
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>

                <div>
                  <Label htmlFor="cover">Обложка (URL изображения)</Label>
                  <Input
                    id="cover"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="border-orange-200 focus:border-orange-400"
                  />
                  {coverImage && (
                    <div className="mt-2 rounded-lg overflow-hidden">
                      <img src={coverImage} alt="Preview" className="w-full h-40 object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <Label>Теги</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Добавить тег..."
                      className="border-orange-200 focus:border-orange-400"
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      variant="outline"
                      className="border-orange-200"
                    >
                      <Icon name="Plus" className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Badge key={tag} className="bg-orange-100 text-orange-700 pr-1">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-orange-900"
                        >
                          <Icon name="X" className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="content">Содержание</Label>
                  <div className="mb-2 flex flex-wrap gap-1">
                    <Button type="button" variant="outline" size="sm" onClick={() => applyFormat('bold')}>
                      <Icon name="Bold" className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => applyFormat('italic')}>
                      <Icon name="Italic" className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => applyFormat('heading')}>
                      <Icon name="Heading" className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => applyFormat('quote')}>
                      <Icon name="Quote" className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => applyFormat('link')}>
                      <Icon name="Link" className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => applyFormat('list')}>
                      <Icon name="List" className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    id="content"
                    ref={contentRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Начните писать ваш пост... 

Поддерживается Markdown-форматирование:
## Заголовок
**Жирный текст**
*Курсив*
> Цитата
[Ссылка](URL)
- Список"
                    rows={20}
                    className="font-mono border-orange-200 focus:border-orange-400"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:sticky lg:top-4 lg:self-start">
            <Card className="border-orange-100">
              <CardHeader>
                <CardTitle className="text-orange-900 flex items-center gap-2">
                  <Icon name="Eye" className="h-5 w-5" />
                  Предпросмотр
                </CardTitle>
              </CardHeader>
              <CardContent>
                {title && (
                  <h1 className="text-3xl font-bold text-orange-900 mb-4">{title}</h1>
                )}
                {excerpt && (
                  <p className="text-gray-600 italic mb-6 pb-6 border-b border-gray-200">{excerpt}</p>
                )}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map(tag => (
                      <Badge key={tag} className="bg-orange-100 text-orange-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderPreview() }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
