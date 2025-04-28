import PropTypes from 'prop-types'
import { Accessor } from './types'

export const accessor: PropTypes.Validator<Accessor> = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.func
]) 