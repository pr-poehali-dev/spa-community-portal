import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author_id: number;
  author_name: string;
  author_avatar?: string;
  cover_image?: string;
  published_at: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  tags: string[];
  reading_time: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      if (isMounted) setLoading(true);
      try {
        const response = await fetch('https://functions.poehali.dev/75e27ae0-e41a-4c42-8f6a-0d66ca396765?action=list&draft=false');
        const data = await response.json();
        if (isMounted) setPosts(data.posts || []);
      } catch (error) {
        if (isMounted) console.error('Failed to fetch posts:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-orange-900 mb-4">
            📝 Блог СПАРКОМ
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Истории, советы и новости о банях, мастерах и событиях
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Icon name="Search" className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Поиск по статьям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-orange-200 focus:border-orange-400"
            />
          </div>
          
          <Link to="/blog/editor">
            <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">
              <Icon name="Plus" className="h-4 w-4 mr-2" />
              Написать пост
            </Button>
          </Link>
        </div>

        {allTags.length > 0 && (
          <div className="mb-8 flex gap-2 flex-wrap">
            <Button
              variant={selectedTag === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(null)}
              className={selectedTag === null ? "bg-orange-500" : ""}
            >
              Все
            </Button>
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(tag)}
                className={selectedTag === tag ? "bg-orange-500" : ""}
              >
                {tag}
              </Button>
            ))}
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <Card className="border-orange-100">
            <CardContent className="py-16 text-center">
              <Icon name="FileText" className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchQuery || selectedTag ? 'Ничего не найдено' : 'Пока нет постов'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || selectedTag 
                  ? 'Попробуйте изменить параметры поиска' 
                  : 'Станьте первым автором блога СПАРКОМ'}
              </p>
              {!searchQuery && !selectedTag && (
                <Link to="/blog/editor">
                  <Button className="bg-gradient-to-r from-orange-500 to-amber-600">
                    Написать первый пост
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <Link key={post.id} to={`/blog/${post.id}`}>
                <Card className="h-full border-orange-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                  {post.cover_image && (
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-200 to-amber-200">
                      <img 
                        src={post.cover_image} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.author_avatar} alt={post.author_name} />
                        <AvatarFallback className="bg-orange-200 text-orange-800 text-xs">
                          {post.author_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {post.author_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(post.published_at)}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-orange-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
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
                      <div className="flex items-center gap-1 ml-auto">
                        <Icon name="Clock" className="h-4 w-4" />
                        <span>{post.reading_time} мин</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}