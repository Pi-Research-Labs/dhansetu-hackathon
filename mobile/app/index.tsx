import { Zap } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { decrement, increment } from '../store/slices/counterSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export default function Home() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white">
      <Zap color="#6366f1" size={32} />
      <Text className="text-xl font-semibold text-slate-900">DhanSetu Mobile</Text>
      <Text className="text-base text-slate-500">Count: {count}</Text>
      <View className="flex-row gap-3">
        <Pressable
          className="rounded-full bg-slate-900 px-4 py-2"
          onPress={() => dispatch(decrement())}
        >
          <Text className="font-medium text-white">-</Text>
        </Pressable>
        <Pressable
          className="rounded-full bg-slate-900 px-4 py-2"
          onPress={() => dispatch(increment())}
        >
          <Text className="font-medium text-white">+</Text>
        </Pressable>
      </View>
    </View>
  );
}
