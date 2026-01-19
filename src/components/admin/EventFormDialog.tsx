import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EventFormData {
  slug: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: string;
  total_spots: number;
  price: number;
  image_url: string;
}

interface EventFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  formData: EventFormData;
  onFormDataChange: (data: EventFormData) => void;
  onSubmit: () => void;
}

const EventFormDialog = ({
  isOpen,
  onOpenChange,
  mode,
  formData,
  onFormDataChange,
  onSubmit,
}: EventFormDialogProps) => {
  const isEdit = mode === 'edit';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактировать событие' : 'Новое событие'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Измените информацию о событии' : 'Заполните информацию о событии'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor={`${mode}-title`}>Название события</Label>
            <Input
              id={`${mode}-title`}
              value={formData.title}
              onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
              placeholder="Фестиваль банной культуры"
            />
          </div>
          <div>
            <Label htmlFor={`${mode}-slug`}>Slug (URL)</Label>
            <Input
              id={`${mode}-slug`}
              value={formData.slug}
              onChange={(e) => onFormDataChange({ ...formData, slug: e.target.value })}
              placeholder="festival-bannoy-kultury"
            />
          </div>
          <div>
            <Label htmlFor={`${mode}-description`}>Описание</Label>
            <Textarea
              id={`${mode}-description`}
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              placeholder="Подробное описание события..."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`${mode}-date`}>Дата</Label>
              <Input
                id={`${mode}-date`}
                type="date"
                value={formData.date}
                onChange={(e) => onFormDataChange({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor={`${mode}-time`}>Время</Label>
              <Input
                id={`${mode}-time`}
                type="time"
                value={formData.time}
                onChange={(e) => onFormDataChange({ ...formData, time: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor={`${mode}-location`}>Локация</Label>
            <Input
              id={`${mode}-location`}
              value={formData.location}
              onChange={(e) => onFormDataChange({ ...formData, location: e.target.value })}
              placeholder="Москва, Банная ул., 1"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor={`${mode}-type`}>Тип</Label>
              <Select value={formData.type} onValueChange={(value) => onFormDataChange({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Мужское</SelectItem>
                  <SelectItem value="women">Женское</SelectItem>
                  <SelectItem value="mixed">Смешанное</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`${mode}-total_spots`}>Макс. мест</Label>
              <Input
                id={`${mode}-total_spots`}
                type="number"
                value={formData.total_spots}
                onChange={(e) => onFormDataChange({ ...formData, total_spots: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor={`${mode}-price`}>Цена, ₽</Label>
              <Input
                id={`${mode}-price`}
                type="number"
                value={formData.price}
                onChange={(e) => onFormDataChange({ ...formData, price: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor={`${mode}-image_url`}>URL изображения</Label>
            <Input
              id={`${mode}-image_url`}
              value={formData.image_url}
              onChange={(e) => onFormDataChange({ ...formData, image_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button
              onClick={onSubmit}
              className="bg-gradient-to-r from-orange-500 to-amber-600"
            >
              {isEdit ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventFormDialog;
