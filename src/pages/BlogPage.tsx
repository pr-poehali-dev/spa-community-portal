import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { getBlogPosts, BlogPost } from '@/lib/api';

const getCategoryLabel = (category: string) => {
  switch(category) {
    case 'rituals': return 'Ритуалы';
    case 'health': return 'Здоровье';
    case 'diy': return 'Своими руками';
    case 'history': return 'История';
    default: return category;
  }
};

const getCategoryColor = (category: string) => {
  switch(category) {
    case 'rituals': return 'bg-purple-100 text-purple-800';
    case 'health': return 'bg-green-100 text-green-800';
    case 'diy': return 'bg-orange-100 text-orange-800';
    case 'history': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    getBlogPosts()
      .then(data => setPosts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { value: 'all', label: 'Все статьи', icon: 'BookOpen' },
    { value: 'rituals', label: 'Ритуалы', icon: 'Flame' },
    { value: 'health', label: 'Здоровье', icon: 'Heart' },
    { value: 'diy', label: 'Своими руками', icon: 'Wrench' },
    { value: 'history', label: 'История', icon: 'Scroll' },
  ];

  const filteredPosts = posts.filter(post => {
    if (selectedCategory !== 'all' && post.category !== selectedCategory) return false;
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase()) && !post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4">Банная энциклопедия</h1>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Статьи о традициях, здоровье и искусстве парения
      </p>

      <div className="mb-8">
        <Input
          placeholder="Поиск статей..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md mx-auto mb-6"
        />
        
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map(cat => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.value)}
              className="gap-2"
            >
              <Icon name={cat.icon as any} size={16} />
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {filteredPosts.length > 0 ? (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Link to={`/blog/${post.slug}`} key={post.id}>
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${post.image_url})` }}
                />
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(post.category)}>
                      {getCategoryLabel(post.category)}
                    </Badge>
                  </div>
                  <CardTitle className="font-serif text-xl hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icon name="User" size={16} />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" size={16} />
                      <span>{new Date(post.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="Search" size={64} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Статьи не найдены</h3>
          <p className="text-muted-foreground mb-4">Попробуйте изменить поисковый запрос или выбрать другую категорию</p>
          <Button 
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
          >
            Сбросить фильтры
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogPage;