export const mockLotteryData = {
  FL: [
    {
      name: 'Powerball',
      code: 'US_MUL_PW',
      plays: [
        {
          name: 'Powerball',
          draws: [
            {
              date: '10/15/2025',
              nextDrawDate: '10/18/2025',
              nextDrawJackpot: 295000000,
              numbers: [
                {value: '10', order: 1, specialBall: null},
                {value: '13', order: 2, specialBall: null},
                {value: '28', order: 3, specialBall: null},
                {value: '34', order: 4, specialBall: null},
                {value: '47', order: 5, specialBall: null},
                {value: '15', order: 6, specialBall: {name: 'Powerball', ballType: 'ball'}}
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'Mega Millions',
      code: 'US_MUL_MM',
      plays: [
        {
          name: 'MEGA Millions',
          draws: [
            {
              date: '10/14/2025',
              nextDrawDate: '10/17/2025',
              nextDrawJackpot: 625000000,
              numbers: [
                {value: '12', order: 1, specialBall: null},
                {value: '22', order: 2, specialBall: null},
                {value: '49', order: 3, specialBall: null},
                {value: '57', order: 4, specialBall: null},
                {value: '58', order: 5, specialBall: null},
                {value: '19', order: 6, specialBall: {name: 'Mega Ball', ballType: 'ball'}}
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'Tennessee Cash',
      code: 'US_TN_TC',
      plays: [
        {
          name: 'Tennessee Cash',
          draws: [
            {
              date: '10/16/2025',
              nextDrawDate: '10/17/2025',
              nextDrawJackpot: 850000,
              numbers: [
                {value: '05', order: 1, specialBall: null},
                {value: '12', order: 2, specialBall: null},
                {value: '23', order: 3, specialBall: null},
                {value: '29', order: 4, specialBall: null},
                {value: '31', order: 5, specialBall: null},
                {value: '04', order: 6, specialBall: {name: 'Cash Ball', ballType: 'ball'}}
              ]
            }
          ]
        }
      ]
    }
  ]
};