import {useCallback, useEffect, useState} from 'react';
import widgetExamplesEnums from '../../enums/widgetExamplesEnums';
import {api} from '../../services/api';

export const usePresets = () => {
  const [exampleGoals, setExampleGoals] = useState([]);

  const getUsersGoalPresets = useCallback(async () => {
    const presets = await api.getUsersGoalPresets()

    setExampleGoals([...widgetExamplesEnums.GOALS, ...presets.widgetPresets])
  }, [])

  useEffect( () => {
    getUsersGoalPresets()
  }, [getUsersGoalPresets])

  const removeUsersGoalPreset = useCallback(async (e, presetId) => {
    e && e.preventDefault()
    if (presetId) {
      await api.removeUsersGoalPreset(presetId)

      const newPresets = exampleGoals.filter(preset => presetId !== preset.presetId)

      setExampleGoals([...newPresets]);
    }
  }, [exampleGoals])

  return {
    exampleGoals,
    getUsersGoalPresets,
    removeUsersGoalPreset
  }
}
