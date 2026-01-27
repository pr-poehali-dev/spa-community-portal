import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author_id: number;
  author_name: string;
  author_avatar?: string;
  cover_image?: string;
  published_at: string;
  is_draft: boolean;
  views_count: number;
  likes_count: number;
  comments_count: number;
  tags: string[];
}

const AdminBlogPage = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const publishedResponse = await fetch('https://functions.poehali.dev/75e27ae0-e41a-4c42-8f6a-0d66ca396765?action=list&draft=false&limit=100');
      const publishedData = await publishedResponse.json();
      
      const draftResponse = await fetch('https://functions.poehali.dev/75e27ae0-e41a-4c42-8f6a-0d66ca396765?action=list&draft=true&limit=100');
      const draftData = await draftResponse.json();
      
      const allPosts = [
        ...(publishedData.posts || []),
        ...(draftData.posts || [])
      ];
      
      setPosts(allPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить посты',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) return;
    
    try {
      await fetch(`https://functions.poehali.dev/75e27ae0-e41a-4c42-8f6a-0d66ca396765?action=delete&post_id=${id}`, {
        method: 'DELETE',
      });
      
      toast({
        title: 'Пост удален',
        description: 'Запись успешно удалена из блога',
      });
      
      loadPosts();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить пост',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    try {
      await fetch(`https://functions.poehali.dev/75e27ae0-e41a-4c42-8f6a-0d66ca396765?action=update&post_id=${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_draft: !post.is_draft,
        }),
      });
      
      toast({
        title: post.is_draft ? 'Пост опубликован' : 'Пост снят с публикации',
        description: post.is_draft ? 'Теперь пост виден всем' : 'Пост сохранён как черновик',
      });
      
      loadPosts();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить статус поста',
        variant: 'destructive',
      });
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'published') return matchesSearch && !post.is_draft;
    if (filterStatus === 'draft') return matchesSearch && post.is_draft;
    return matchesSearch;
  });

  const stats = {
    total: posts.length,
    published: posts.filter(p => !p.is_draft).length,
    draft: posts.filter(p => p.is_draft).length,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-orange-900">Управление блогом</h2>
        <Link to="/blog/editor">
          <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">
            <Icon name="Plus" className="h-4 w-4 mr-2" />
            Создать пост
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Icon name="FileText" className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Всего постов</p>
                <p className="text-2xl font-bold text-orange-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Icon name="CheckCircle" className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Опубликовано</p>
                <p className="text-2xl font-bold text-orange-900">{stats.published}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Icon name="FilePen" className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Черновики</p>
                <p className="text-2xl font-bold text-orange-900">{stats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Поиск по названию или содержанию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
          >
            Все
          </Button>
          <Button
            variant={filterStatus === 'published' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('published')}
          >
            Опубликованные
          </Button>
          <Button
            variant={filterStatus === 'draft' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('draft')}
          >
            Черновики
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredPosts.length === 0 ? (
          <Card className="border-orange-100">
            <CardContent className="py-12 text-center">
              <Icon name="FileText" className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Посты не найдены</p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="border-orange-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {post.cover_image && (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-orange-900">{post.title}</h3>
                          <Badge variant={post.is_draft ? 'secondary' : 'default'}>
                            {post.is_draft ? 'Черновик' : 'Опубликовано'}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={post.author_avatar} alt={post.author_name} />
                              <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                                {post.author_name?.split(' ').map(n => n[0]).join('') || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span>{post.author_name || 'Неизвестный автор'}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Icon name="Eye" className="h-4 w-4" />
                            <span>{post.views_count}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Icon name="Heart" className="h-4 w-4" />
                            <span>{post.likes_count}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Icon name="MessageSquare" className="h-4 w-4" />
                            <span>{post.comments_count}</span>
                          </div>
                        </div>

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {post.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Link to={`/blog/${post.id}`} target="_blank">
                          <Button variant="outline" size="sm">
                            <Icon name="Eye" className="h-4 w-4" />
                          </Button>
                        </Link>
                        
                        <Link to={`/blog/editor?id=${post.id}`}>
                          <Button variant="outline" size="sm">
                            <Icon name="Pencil" className="h-4 w-4" />
                          </Button>
                        </Link>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(post)}
                        >
                          <Icon name={post.is_draft ? 'CheckCircle' : 'XCircle'} className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Icon name="Trash2" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminBlogPage;
