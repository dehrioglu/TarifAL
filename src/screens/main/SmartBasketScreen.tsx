import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../../components/Screen';
import { SmartBasketWizard } from '../../components/SmartBasketWizard';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SmartBasket'>;

export function SmartBasketScreen({ navigation, route }: Props) {
  return (
    <Screen scroll contentStyle={{ paddingTop: 14 }}>
      <SmartBasketWizard
        initialRecipeId={route.params?.recipeId}
        onClose={() => navigation.goBack()}
        onGoCart={() => navigation.navigate('MainTabs', { screen: 'Cart' })}
        onOpenRecipe={(recipeId) => navigation.navigate('RecipeDetail', { recipeId })}
      />
    </Screen>
  );
}
